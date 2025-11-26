const {Station, Route, Assignment} = require("../models");
const {formatSuccess, formatError} = require("../utils/helpers");
const {validationResult} = require("express-validator");

/**
 *  Create a station
 */

const createStation = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {name, code, location, type, facilities} = req.body;

    // Check if station already exists
    const existingStation = await Station.findOne({name});
    if(existingStation) {
      return res.status(400).json(
        formatError("Station already exists", 400)
      );
    }

    // Create Station
    const newStation = await Station.create({
      name,
      code: code.toUpperCase(),
      location,
      type: type || "intermediate",
      facilities : facilities || [],
  });

  return res.status(201).json(
    formatSuccess({newStation}, "Station created successfully")
    );

  }
  catch(error) {
    console.error("Error creating station:", error);
    return res.status(500).json(
      formatError(error.message || "Failed to create station", 500)
    );
  }
};

/**
 *  Get all statoins with filters
*/
const getAllStatoins = async (req, res) => {
  try {
    const {isActive, type, page=1, limit=50} = req.query;

    // Build filter object
    const filter = {};
    if(isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if(type) {
      filter.type = type;
    }

    // Pagination
    const pageNum = parseInt(page,10); // convert page to number
    const limitNum = parseInt(limit,10); // convert limit to number
    const skip = (pageNum - 1) * limitNum; // calculate skip

    // Get total count
    const total = await Station.countDocuments(filter);

    // Get stations
    const stations = await Station.find(filter)
      .skip(skip)
      .sort({name:1})
      .limit(limitNum);

      return res.status(200).json(
        formatSuccess({
          stations,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        }, "Stations fetched successfully")
      )
  }
  catch(error) {
    console.error("Error fetching stations:", error);
    return res.status(500).json(
      formatError(error.message || "Failed to fetch stations", 500)
    );
  }
};

/**
 *  Get a station by id
 */
const getStationById = async (req, res) => {
  try {
    const {id} = req.params;
    const station = await Station.findById(id);
    if(!station) {
      return res.status(404).json(
        formatError("Station not found", 404));
  }
  return res.json(formatSuccess({station}, "Station fetched successfully"));
}
  catch(error) {
    console.error("Error fetching station:", error);
    return res.status(500).json(
      formatError(error.message || "Failed to fetch station", 500)
    );
  }
};

/**
 *  Update a station by id
 */
const updateStationById = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {id} = req.params;
    const {name, code, location, type, facilities, isActive} = req.body;

    const station = await Station.findById(id);
    if(!station) {
      return res.status(404).json(
        formatError("Station not found", 404)
      );
    }

    // Check if new name is already taken
    if(name && name !== station.name) {
      const existingStation = await Station.findOne({name});
      if(existingStation) {
        return res.status(400).json(
          formatError("Station name already taken", 400)
        );
      }
      station.name = name;
    }

    // Check if new code is already taken
    if(code && code.toUpperCase() !== station.code) {
      const existingStation = await Station.findOne({code: code.toUpperCase()});
      if(existingStation) {
        return res.status(400).json(
          formatError("Station code already taken", 400)
        );
      }
      station.code = code.toUpperCase();
    }

    // Update other fields if provided
    if(location) station.location = location;
    if(type) station.type = type;
    if(facilities !== undefined) station.facilities = facilities;
    if(isActive !== undefined) station.isActive = isActive;

    // Save station
    await station.save();

    return res.json(formatSuccess({station}, "Station updated successfully"));
  }
  catch(error) {
    console.error("Error updating station:", error);
    return res.status(500).json(
      formatError(error.message || "Failed to update station", 500)
    );
  }
};

/**
 *  Delete station (soft delete)
 */
const deleteStationById = async (req, res) => {
  try {
    const {id} = req.params;
    const station = await Station.findById(id);
    if(!station) {
      return res.status(404).json(
        formatError("Station not found", 404)
      );
    }

    // Check if station is used in active routes 
    const activeRoute = await Route.findOne({
      $or: [
        {origin: id},
        {destination: id},
        {"stops.station": id},
      ],
      isActive: true,
    });

    if(activeRoute) {
      return res.status(400).json(
        formatError("Station is used in active routes", 400)
      );
    }

    // Check if station is current station in active assignments
    const activeAssignment = await Assignment.findOne({
      currentStation: id,
      status: "ACTIVE",
    });

    if(activeAssignment) {
      return res.status(400).json(
        formatError("Station is current station in active assignments", 400)
      );
    }

    // Delete station
    station.isActive = false;
    await station.save();

    return res.json(formatSuccess({station}, "Station deleted successfully"));

  }
  catch(error) {
    console.error("Error deleting station:", error);
    return res.status(500).json(
      formatError(error.message || "Failed to delete station", 500)
    );
  }
};

/**
 *  Export all controllers
 */
module.exports = {
  createStation,
  getAllStatoins,
  getStationById,
  updateStationById,
  deleteStationById,
};