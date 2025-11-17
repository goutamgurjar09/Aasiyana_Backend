const Category = require("../models/Category");
const { success, error } = require("../utils/responseHandler");

// ✅ Create Category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, createdBy, subCategories } = req.body;

    const existing = await Category.findOne({
      categoryName: { $regex: `^${categoryName}$`, $options: "i" },
    });

    if (existing) {
      return error({
        res,
        message: "Category name already exists",
        code: 400,
      });
    }

    const category = await Category.create({
      categoryName,
      createdBy,
      subCategories,
    });

    return success({
      res,
      data: category,
      message: "Category Created Successfully",
      code: 201,
    });

  } catch (err) {
    return error({ res, message: "Failed to create category", error: err.message });
  }
};

// ✅ Get All Categories with pagination, filter, search
exports.getAllCategories = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, search } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { categoryName: { $regex: regex } },
        { "subCategories.name": { $regex: regex } },
      ];
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const totalCategories = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return success({
      res,
      data: {
        categories,
        totalCategories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        hasNextPage: page * limit < totalCategories,
        hasPrevPage: page > 1,
      },
      message: "Categories fetched successfully",
    });

  } catch (err) {
    return error({ res, message: "Failed to fetch categories", error: err.message });
  }
};

// ✅ Get Category By ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return error({
        res,
        message: "Category not found",
        code: 404,
      });
    }

    return success({ res, data: category });
  } catch (err) {
    return error({ res, message: "Failed to fetch category", error: err.message });
  }
};

// ✅ Update Category with duplicate check
exports.updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (categoryName) {
      const existing = await Category.findOne({
        categoryName: { $regex: `^${categoryName}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return error({
          res,
          message: "Category name already exists",
          code: 400,
        });
      }
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return error({
        res,
        message: "Category not found",
        code: 404,
      });
    }

    return success({
      res,
      data: updated,
      message: "Category Updated Successfully"
    });

  } catch (err) {
    return error({ res, message: "Failed to update category", error: err.message });
  }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return error({
        res,
        message: "Category not found",
        code: 404,
      });
    }

    return success({
      res,
      data: deleted,
      message: "Category Deleted Successfully"
    });

  } catch (err) {
    return error({ res, message: "Failed to delete category", error: err.message });
  }
};

// ✅ Add Sub Category
exports.addSubCategory = async (req, res) => {
  try {
    const { name, status = true } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return error({ res, message: "Category not found", code: 404 });
    }

    category.subCategories.push({ name, status });
    await category.save();

    return success({
      res,
      data: category,
      message: "Subcategory added",
      code: 201,
    });

  } catch (err) {
    return error({ res, message: "Failed to add subcategory", error: err.message });
  }
};

// ✅ Update SubCategory by Index
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    const category = await Category.findById(req.params.categoryId);
    if (!category)
      return error({ res, message: "Category not found", code: 404 });

    const sub = category.subCategories[req.params.subIndex];
    if (!sub)
      return error({ res, message: "Subcategory not found", code: 404 });

    if (name !== undefined) sub.name = name;
    if (status !== undefined) sub.status = status;

    await category.save();

    return success({
      res,
      data: category,
      message: "Subcategory updated successfully"
    });

  } catch (err) {
    return error({ res, message: "Failed to update subcategory", error: err.message });
  }
};

// ✅ Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category)
      return error({ res, message: "Category not found", code: 404 });

    const sub = category.subCategories[req.params.subIndex];
    if (!sub)
      return error({ res, message: "Subcategory not found", code: 404 });

    category.subCategories.splice(req.params.subIndex, 1);
    await category.save();

    return success({
      res,
      data: category,
      message: "Subcategory deleted successfully"
    });

  } catch (err) {
    return error({ res, message: "Failed to delete subcategory", error: err.message });
  }
};

// ✅ Update Category Status
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { categoryId, status } = req.body;

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      { status },
      { new: true }
    );

    if (!updated)
      return error({ res, message: "Category not found", code: 404 });

    return success({
      res,
      data: updated,
      message: "Category status updated successfully"
    });

  } catch (err) {
    return error({ res, message: "Failed to update status", error: err.message });
  }
};
