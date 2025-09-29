import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Announcement {
  announcementId?: string;
  title: string;
  selectedAudience: string;
  selectedRecipients: string[];
  message: string;
  file?: string | null;
  createdDate: string;
  schoolId: string;
  createdBy: string;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
}

export interface CreateAnnouncementRequest {
  title: string;
  selectedAudience: string;
  selectedRecipients: string[];
  message: string;
  file?: File | null;
  schoolId: string;
  createdBy: string;
}

export interface UpdateAnnouncementRequest {
  title: string;
  selectedAudience: string;
  selectedRecipients: string[];
  message: string;
  file?: File | null;
  createdDate?: string;
}

export const announcementService = {
  /**
   * Fetch all announcements for a specific school
   */
  async getAnnouncementsBySchool(schoolId: string): Promise<Announcement[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_SCHOOL.replace(':schoolId', schoolId);
      const response = await apiClient.get(endpoint);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  },

  /**
   * Create a new announcement
   */
  async createAnnouncement(announcementData: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const formData = new FormData();
      formData.append('schoolId', announcementData.schoolId);
      formData.append('title', announcementData.title);
      formData.append('selectedAudience', announcementData.selectedAudience);
      formData.append('selectedRecipients', JSON.stringify(announcementData.selectedRecipients));
      formData.append('message', announcementData.message);
      formData.append('createdDate', new Date().toISOString());
      formData.append('createdBy', announcementData.createdBy);
      
      // Add file if present
      if (announcementData.file) {
        formData.append('file', announcementData.file);
      }

      const endpoint = API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.CREATE_ANNOUNCEMENT.replace(':schoolId', announcementData.schoolId);
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.announcement) {
        return response.data.announcement;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  },

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(
    schoolId: string, 
    announcementId: string, 
    announcementData: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.UPDATE_ANNOUNCEMENT
        .replace(':schoolId', schoolId)
        .replace(':announcementId', announcementId);
      
      let response;
      
      if (announcementData.file) {
        // If there's a file, use FormData (backend supports file uploads)
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('title', announcementData.title);
        formData.append('selectedAudience', announcementData.selectedAudience);
        formData.append('selectedRecipients', JSON.stringify(announcementData.selectedRecipients));
        formData.append('message', announcementData.message);
        formData.append('createdDate', new Date().toISOString());
        formData.append('createdBy', 'SchoolAdmin');
        formData.append('file', announcementData.file);
        
        console.log('🔍 UPDATE ANNOUNCEMENT - FormData Request (with file):');
        console.log('Endpoint:', endpoint);
        console.log('FormData contents:');
        formData.forEach((value, key) => {
          console.log(`${key}:`, value);
        });
        
        response = await apiClient.put(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If no file, use JSON
        const updateData = {
          schoolId: schoolId,
          title: announcementData.title,
          selectedAudience: announcementData.selectedAudience,
          selectedRecipients: announcementData.selectedRecipients,
          message: announcementData.message,
          createdDate: new Date().toISOString(),
          createdBy: 'SchoolAdmin'
        };
        
        console.log('🔍 UPDATE ANNOUNCEMENT - JSON Request (no file):');
        console.log('Endpoint:', endpoint);
        console.log('Request Body:', JSON.stringify(updateData, null, 2));
        
        response = await apiClient.put(endpoint, updateData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (response.data.message === 'Announcement updated successfully') {
        // Since the API doesn't return the updated announcement, we need to fetch it again
        // or return a success indicator. For now, we'll return a success message.
        return {
          announcementId,
          title: announcementData.title,
          selectedAudience: announcementData.selectedAudience,
          selectedRecipients: announcementData.selectedRecipients,
          message: announcementData.message,
          file: announcementData.file ? 'updated' : undefined, // Indicate if file was updated
          createdDate: announcementData.createdDate || new Date().toISOString(),
          schoolId,
          createdBy: 'SchoolAdmin'
        };
      }
      
      throw new Error('Failed to update announcement');
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw new Error('Failed to update announcement');
    }
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(schoolId: string, announcementId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.DELETE_ANNOUNCEMENT
        .replace(':schoolId', schoolId)
        .replace(':announcementId', announcementId);
      
      const response = await apiClient.delete(endpoint);
      
      if (response.data.message === 'Announcement and file deleted successfully') {
        console.log('✅ Announcement deleted successfully');
      } else {
        console.log('⚠️ Unexpected delete response:', response.data);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(schoolId: string, announcementId: string): Promise<Announcement | null> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_SCHOOL.replace(':schoolId', schoolId)}/${announcementId}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      return null;
    }
  },

  /**
   * Get announcements by class or teacher for teacher admin
   */
  async getAnnouncementsByClassOrTeacher(schoolId: string, classId: string, teacherId: string): Promise<Announcement[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_CLASS_OR_TEACHER
        .replace(':schoolId', schoolId)
        .replace(':classId', classId)
        .replace(':teacherId', teacherId);
      
      const response = await apiClient.get(endpoint);

      // Handle both array and wrapped object responses
      if (Array.isArray(response.data)) {
        return response.data as Announcement[];
      }
      if (Array.isArray(response.data?.announcements)) {
        return response.data.announcements as Announcement[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching announcements by class or teacher:', error);
      throw new Error('Failed to fetch announcements');
    }
  }
}; 