const sequelize = require('../config/postgres');


//⭐ Create Location service
const createLocation = async (city, state, pincode) => {
    if (!city || !state || !pincode) throw new Error("All fields are required");
    
    const [result] = await sequelize.query(
      'INSERT INTO locations (city, state, pincode, "createdAt", "updatedAt") VALUES (:city, :state, :pincode, NOW(), NOW()) RETURNING *',
      {
        replacements: { city, state, pincode },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    return result[0];
}

//⭐ Get All Locations service
const getAllLocations = async () => {
    const [result] = await sequelize.query(
      'SELECT * FROM locations'
    );
    return result;
}

//⭐ Get Location by ID service
const getLocationById = async (id) => {
    const [result] = await sequelize.query(
      'SELECT * FROM locations WHERE id = :id',
      {
        replacements: { id },
      
      }
    );
    return result[0];
}

//⭐ Update Location service
const updateLocation = async (id, city, state, pincode) => {
    const fieldsToUpdate = [];
    const replacements = { id };

    if (city !== undefined) {
        fieldsToUpdate.push('city = :city');
        replacements.city = city;
    }
    if (state !== undefined) {
        fieldsToUpdate.push('state = :state');
        replacements.state = state;
    }
    if (pincode !== undefined) {
        fieldsToUpdate.push('pincode = :pincode');
        replacements.pincode = pincode;
    }

    if (fieldsToUpdate.length === 0) return null;

    const query = `
      UPDATE locations
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = :id
      RETURNING *`;

    const [result] = await sequelize.query(query, { replacements });
    return result[0];
};


//⭐ Delete Location service 
const deleteLocation = async (id) => {
    const [result] = await sequelize.query(
      'DELETE FROM locations WHERE id = :id RETURNING *',
      {
        replacements: { id },
     
      }
    );
    return result[0];
}

module.exports = {
    createLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
    deleteLocation
}

