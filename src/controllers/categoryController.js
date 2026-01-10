import Category from '../models/Category.js';

// Helper to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (SuperAdmin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, parent, sortOrder } = req.body;

    // Validate required field
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if category already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const { parent, isActive } = req.query;

    const query = {};
    if (parent !== undefined) {
      query.parent = parent === 'null' ? null : parent;
    }
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      'parent',
      'name slug'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get subcategories
    const subcategories = await Category.find({ parent: category._id });

    res.status(200).json({
      success: true,
      category,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (SuperAdmin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image, parent, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Update fields
    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (SuperAdmin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.findOne({ parent: category._id });
    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
    });
  }
};
