import type { Prisma, Product, ProductStatus } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { AppError } from "../middlewares/error-handler.js";
import { toNumber } from "../utils/period.js";
import type {
  CreateCategoryInput,
  CreateProductInput,
  ListProductsInput,
  UpdateProductInput,
} from "../validators/products.validators.js";

type ProductWithCategory = Product & {
  category: { id: string; name: string; slug: string } | null;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function serializeProduct(product: ProductWithCategory) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: toNumber(product.price),
    stock: product.stock,
    status: product.status,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    category: product.category,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

const productInclude = {
  category: true,
} satisfies Prisma.ProductInclude;

export const productsService = {
  async list(input: ListProductsInput) {
    const where: Prisma.ProductWhereInput = {};

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input.status) {
      where.status = input.status as ProductStatus;
    }

    if (input.categoryId) {
      where.categoryId = input.categoryId;
    }

    const skip = (input.page - 1) * input.pageSize;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { updatedAt: "desc" },
        skip,
        take: input.pageSize,
      }),
    ]);

    return {
      data: products.map(serializeProduct),
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      },
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new AppError(404, "Produto não encontrado");
    }
    return serializeProduct(product);
  },

  async create(input: CreateProductInput) {
    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new AppError(400, "Categoria inválida");
      }
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        stock: input.stock,
        status: input.status,
        categoryId: input.categoryId ?? null,
      },
      include: productInclude,
    });

    return serializeProduct(product);
  },

  async update(id: string, input: UpdateProductInput) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Produto não encontrado");
    }

    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new AppError(400, "Categoria inválida");
      }
    }

    const data: Prisma.ProductUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price;
    if (input.stock !== undefined) data.stock = input.stock;
    if (input.status !== undefined) data.status = input.status;
    if (input.categoryId !== undefined) {
      data.category = input.categoryId
        ? { connect: { id: input.categoryId } }
        : { disconnect: true };
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });

    return serializeProduct(product);
  },

  async remove(id: string) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Produto não encontrado");
    }

    const orderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return { ok: true, archived: true };
    }

    await prisma.product.delete({ where: { id } });
    return { ok: true, archived: false };
  },

  async updateImage(id: string, imageUrl: string) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Produto não encontrado");
    }

    const product = await prisma.product.update({
      where: { id },
      data: { imageUrl },
      include: productInclude,
    });

    return serializeProduct(product);
  },

  async listCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productsCount: category._count.products,
    }));
  },

  async createCategory(input: CreateCategoryInput) {
    const name = input.name.trim();
    const slug = slugify(name);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
      },
    });
    if (existing) {
      throw new AppError(409, "Categoria já existe");
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      productsCount: 0,
    };
  },
};
