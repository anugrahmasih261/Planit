import axios from 'axios';

const API_URL = 'http://localhost:8000/api/trips';

// Helper function to create config with auth token
const getConfig = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Unified error handling
const handleApiError = (error) => {
  if (error.response) {
    // Forward the backend's error response
    throw error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    throw { detail: 'Network error. Please check your connection.' };
  } else {
    // Something happened in setting up the request
    throw { detail: 'Request error. Please try again.' };
  }
};

const createTrip = async (tripData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/`, 
      tripData, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getTrips = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/`, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getTrip = async (tripId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/${tripId}/`, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const updateTrip = async (tripId, tripData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/${tripId}/`, 
      tripData, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const deleteTrip = async (tripId, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${tripId}/`, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const inviteUser = async (tripId, email, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${tripId}/invite/`, 
      { email }, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const joinTrip = async (tripCode, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/join/`, 
      { trip_code: tripCode }, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const createActivity = async (tripId, activityData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${tripId}/activities/`, 
      activityData, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getActivities = async (tripId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/${tripId}/activities/`, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const updateActivity = async (tripId, activityId, activityData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/${tripId}/activities/${activityId}/`, 
      activityData, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const deleteActivity = async (tripId, activityId, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${tripId}/activities/${activityId}/`, 
      getConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};


// this is old

// const voteActivity = async (tripId, activityId, vote, token) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/${tripId}/activities/${activityId}/vote/`, 
//       { vote }, 
//       getConfig(token)
//     );
//     return response.data;
//   } catch (error) {
//     handleApiError(error);
//   }
// };

// this is new if no change delete

const voteActivity = async (tripId, activityId, vote, token) => {
  try {
      const response = await axios.post(
          `${API_URL}/${tripId}/activities/${activityId}/vote/`, 
          { vote }, 
          getConfig(token)
      );
      return response.data;
  } catch (error) {
      handleApiError(error);
  }
};



const tripService = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  inviteUser,
  joinTrip,
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  voteActivity
};

export default tripService;