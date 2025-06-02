
const sequelize = require('../config/postgres');


// Create new Category
const createCategory = async (name) => {
    if (!name) throw new Error("Name is required");
    
    const [result] = await sequelize.query(
      'INSERT INTO categories (name, "createdAt", "updatedAt") VALUES (:name, NOW(), NOW()) RETURNING *',
      {
        replacements: { name },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    return result[0];
}


// Get all Categories
const getAllCategories = async () => {
    const [result] = await sequelize.query('SELECT * FROM categories');
    return result;
}


// Get Category by ID
async function getCategoryById(id) {
    const res = await sequelize.query('SELECT * FROM categories WHERE id = :id', { replacements: { id },
    type: sequelize.QueryTypes.SELECT
 });
    return res[0];
}

// Update Category
async function updateCategory(id, name) {
    const res = await sequelize.query('UPDATE categories SET name = :name WHERE id = :id RETURNING *', { replacements: { id, name },
    type: sequelize.QueryTypes.UPDATE
 });
    return res[0];
}



module.exports = {
    getAllCategories,
    getCategoryById,
    updateCategory,
    createCategory
}