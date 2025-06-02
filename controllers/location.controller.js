const locationService = require("../services/location.service");


//✅ add a new location
const addLocation = async (req, res) => {
    try {
        const { city, state, pincode } = req.body;
        if (!city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const location = await locationService.createLocation(city, state, pincode);
        return res.status(201).json({
            success: true,
            message: "Location added successfully",
            location
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to add location"
        })
    }
}

//✅ view all locations
const viewAllLocation = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        return res.status(200).json({
            success: true,
            message: "All Locations fetched successfully",
            locations
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch  All locations "
        })
    }
}

//✅ view location by ID
const viewLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await locationService.getLocationById(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Location fetched successfully",
            location
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch location by ID"
        })
    }
}

//✅ update location by ID
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { city, state, pincode } = req.body;
        const location = await locationService.updateLocation(id, city, state, pincode);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            location
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update location"
        })
    }
}

//✅ delete location by ID
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await locationService.deleteLocation(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Location deleted successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete location"
        })
    }
}

module.exports = {
    addLocation,
    viewAllLocation,
    viewLocationById,
    updateLocation,
    deleteLocation
}
