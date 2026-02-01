import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSchoolService, School } from '../../../services/masterAdminSchoolService';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  School as SchoolIcon,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import AddSchoolModal from './AddSchoolModal';
import EditSchoolModal from './EditSchoolModal';
import DeleteConfirmModal from './DeleteConfirmModal';

// Logo Cell Component
const SchoolLogoCell: React.FC<{ school: School }> = ({ school }) => {
  const [imageError, setImageError] = useState(false);

  if (school.logo && !imageError) {
    return (
      <div className="flex items-center justify-center">
        <img
          src={school.logo}
          alt={school.schoolName}
          className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
        school.isActive
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <SchoolIcon className={`w-6 h-6 ${
          school.isActive
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-400'
        }`} />
      </div>
    </div>
  );
};

const Schools: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await masterAdminSchoolService.getSchools();
      setSchools(data);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error(error.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (schoolData: Partial<School>) => {
    try {
      setActionLoading('add');
      await masterAdminSchoolService.addSchool(schoolData);
      toast.success('School added successfully!');
      setAddModalOpen(false);
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSchool = async (schoolId: string, schoolData: Partial<School>) => {
    try {
      setActionLoading('edit');
      await masterAdminSchoolService.updateSchool(schoolId, schoolData);
      toast.success('School updated successfully!');
      setEditModalOpen(false);
      setSelectedSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      setActionLoading('delete');
      await masterAdminSchoolService.deleteSchool(schoolId);
      toast.success('School deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActivation = async (school: School) => {
    const schoolId = school.id || school.schoolId || '';
    if (!schoolId) return;

    try {
      setActionLoading(`toggle-${schoolId}`);
      const newStatus = !school.isActive;
      await masterAdminSchoolService.toggleSchoolActivation(schoolId, newStatus);
      toast.success(`School ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle school status');
    } finally {
      setActionLoading(null);
    }
  };

  const openViewModal = (school: School) => {
    const schoolId = school.id || school.schoolId || '';
    if (schoolId) {
      navigate(`/master-admin/schools/${schoolId}`);
    }
  };

  const openEditModal = (school: School) => {
    setSelectedSchool(school);
    setEditModalOpen(true);
  };

  const openDeleteModal = (school: School) => {
    setSelectedSchool(school);
    setDeleteModalOpen(true);
  };

  const filteredSchools = schools.filter(school =>
    school.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.phoneNo?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Schools Management
          </h1>
          <p className={`mt-1 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage all schools in the platform
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors w-full sm:w-auto touch-manipulation min-h-[44px] ${
            isDarkMode
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          Add School
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          placeholder="Search schools by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Schools Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {filteredSchools.length === 0 ? (
          <div className={`text-center py-12 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <SchoolIcon className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {searchTerm ? 'No schools found matching your search' : 'No schools found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[700px]">
              <thead className={`${
                isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
              }`}>
                <tr>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Logo
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    School Name
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Email
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Phone
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden xl:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Location
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Academic Year
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredSchools.map((school) => {
                  const schoolId = school.id || school.schoolId || '';
                  const isToggleLoading = actionLoading === `toggle-${schoolId}`;
                  
                  return (
                    <tr
                      key={schoolId}
                      onClick={() => {
                        if (schoolId) {
                          navigate(`/master-admin/schools/${schoolId}`);
                        }
                      }}
                      className={`transition-colors cursor-pointer hover:${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      {/* Logo */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <SchoolLogoCell school={school} />
                      </td>
                      {/* School Name */}
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="font-medium">{school.schoolName}</span>
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {school.email}
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {school.phoneNo}
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {school.city && school.state 
                          ? `${school.city}, ${school.state}`
                          : school.city || school.state || '-'
                        }
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {school.currentAcademicYear || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {school.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {/* View Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const schoolId = school.id || school.schoolId || '';
                              navigate(`/master-admin/schools/${schoolId}`);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:bg-gray-700 hover:text-blue-400'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                            }`}
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(school);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:bg-gray-700 hover:text-indigo-400'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'
                            }`}
                            title="Edit School"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Activate/Deactivate Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActivation(school);
                            }}
                            disabled={isToggleLoading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              school.isActive
                                ? isDarkMode
                                  ? 'text-orange-400 hover:bg-gray-700 hover:text-orange-300'
                                  : 'text-orange-600 hover:bg-orange-50'
                                : isDarkMode
                                  ? 'text-green-400 hover:bg-gray-700 hover:text-green-300'
                                  : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={school.isActive ? 'Deactivate School' : 'Activate School'}
                          >
                            {isToggleLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : school.isActive ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(school);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:bg-gray-700 hover:text-red-400'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
                            }`}
                            title="Delete School"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSchoolModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddSchool}
        loading={actionLoading === 'add'}
      />

      {selectedSchool && (
        <>
          <EditSchoolModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedSchool(null);
            }}
            onUpdate={handleEditSchool}
            school={selectedSchool}
            loading={actionLoading === 'edit'}
          />

          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedSchool(null);
            }}
            onConfirm={handleDeleteSchool}
            school={selectedSchool}
            loading={actionLoading === 'delete'}
          />
        </>
      )}
    </div>
  );
};

export default Schools;
