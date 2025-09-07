import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Event {
  eventId?: string;
  schoolId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  filePath?: string | null;
  createdDate?: string;
  isTemplate?: boolean;
}

export interface CreateEventRequest {
  schoolId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  file?: File | null;
}

export interface UpdateEventRequest {
  schoolId: string;
  eventId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  file?: File | null;
}

export interface EventsResponse {
  events: Event[];
}

export interface EventResponse {
  event: Event;
}

export interface DeleteMultipleEventsRequest {
  eventIds: string[];
}

class EventService {
  // Create a new event
  async createEvent(data: CreateEventRequest): Promise<EventResponse> {
    const formData = new FormData();
    formData.append('schoolId', data.schoolId);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('time', data.time);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.EVENTS.CREATE.replace(':schoolId', data.schoolId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Get all events for a school
  async getEvents(schoolId: string): Promise<EventsResponse> {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.EVENTS.GET_ALL.replace(':schoolId', schoolId)
    );
    return response.data;
  }

  // Get a single event by ID
  async getEventById(schoolId: string, eventId: string): Promise<EventResponse> {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID
        .replace(':schoolId', schoolId)
        .replace(':eventId', eventId)
    );
    return response.data;
  }

  // Update an event
  async updateEvent(data: UpdateEventRequest): Promise<EventResponse> {
    const formData = new FormData();
    formData.append('schoolId', data.schoolId);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('time', data.time);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.EVENTS.UPDATE
        .replace(':schoolId', data.schoolId)
        .replace(':eventId', data.eventId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Delete an event
  async deleteEvent(schoolId: string, eventId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      API_CONFIG.ENDPOINTS.EVENTS.DELETE
        .replace(':schoolId', schoolId)
        .replace(':eventId', eventId)
    );
    return response.data;
  }

  // Delete multiple events
  async deleteMultipleEvents(schoolId: string, data: DeleteMultipleEventsRequest): Promise<{ message: string }> {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.EVENTS.DELETE_MULTIPLE.replace(':schoolId', schoolId),
      data
    );
    return response.data;
  }
}

export const eventService = new EventService(); 