
const categoryService = require("../services/categories.service");

const createCategory = async(req, res) =>{
    try {
        const {name:categoryName} = req.body;
        if(!categoryName){
            return res.status(400).json({success:false, message:"Name is required"})
        }
        const category = await categoryService.createCategory(categoryName);
        return res.status(201).json({success:true, message:"Category created successfully", category})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

const getAllCategories = async(req, res) =>{
    try {
        const categoriesList = await categoryService.getAllCategories();
        return res.status(200).json({success:true, message:"Categories fetched successfully", categoriesList})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

const getCategoryById = async(req, res) =>{
    try {
        const {id:categoryId} = req.params;
        if(!categoryId){
            return res.status(400).json({success:false, message:"Id is required"})
        }
        const category = await categoryService.getCategoryById(categoryId);
        return res.status(200).json({success:true, message:"Category fetched successfully", category})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

const updateCategory = async(req, res) =>{
    try {
        const {id:categoryId} = req.params;
        const {name:categoryName} = req.body;
        if(!categoryId || !categoryName){
            return res.status(400).json({success:false, message:"Id and name are required"})
        }
        const category = await categoryService.updateCategory(categoryId, categoryName);
        return res.status(200).json({success:true, message:"Category updated successfully", category})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory
};
