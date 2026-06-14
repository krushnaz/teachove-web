import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSchoolService, School } from '../../../services/masterAdminSchoolService';
import { masterAdminSubscriptionService, SubscriptionRequest } from '../../../services/masterAdminSubscriptionService';
import { buildSchoolPlanMap } from '../../../utils/schoolPlanHelpers';
import { 
  Plus, 
  Search, 
  School as SchoolIcon,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AddSchoolModal from './AddSchoolModal';
import EditSchoolModal from './EditSchoolModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import SchoolActionsMenu from './SchoolActionsMenu';
import SchoolPlanBadge from './SchoolPlanBadge';

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
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const [schoolData, subResponse] = await Promise.all([
        masterAdminSchoolService.getSchools(),
        masterAdminSubscriptionService.getAllSubscriptionRequests(),
      ]);
      setSchools(schoolData);
      setSubscriptions(subResponse.subscriptions || []);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error(error.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const planMap = useMemo(() => buildSchoolPlanMap(schools, subscriptions), [schools, subscriptions]);

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
          placeholder="Search schools by name or phone..."
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
            <table className="w-full min-w-[640px]">
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
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Phone
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Academic Year
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Plan
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
                  const plan = planMap.get(schoolId) || { status: 'none' as const, planLabel: 'No Plan' };
                  
                  return (
                    <tr
                      key={schoolId}
                      onClick={() => {
                        if (schoolId) {
                          navigate(`/master-admin/schools/${schoolId}`);
                        }
                      }}
                      className={`transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <SchoolLogoCell school={school} />
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{school.schoolName}</span>
                          <div className="flex flex-wrap items-center gap-1.5 lg:hidden">
                            <SchoolPlanBadge plan={plan} compact />
                            {school.isFreeTrial && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                <Sparkles className="h-2.5 w-2.5" />
                                Trial
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {school.phoneNo || '-'}
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell ${
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <SchoolPlanBadge plan={plan} />
                          {school.isFreeTrial && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              <Sparkles className="h-2.5 w-2.5" />
                              Free Trial
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <SchoolActionsMenu
                            school={school}
                            isOpen={openMenuId === schoolId}
                            isToggleLoading={isToggleLoading}
                            onToggle={() => setOpenMenuId(openMenuId === schoolId ? null : schoolId)}
                            onClose={() => setOpenMenuId(null)}
                            onView={() => {
                              setOpenMenuId(null);
                              openViewModal(school);
                            }}
                            onViewPlans={() => {
                              setOpenMenuId(null);
                              navigate(`/master-admin/schools/${schoolId}`, { state: { tab: 'plans' } });
                            }}
                            onEdit={() => {
                              setOpenMenuId(null);
                              openEditModal(school);
                            }}
                            onToggleActivation={() => {
                              setOpenMenuId(null);
                              handleToggleActivation(school);
                            }}
                            onDelete={() => {
                              setOpenMenuId(null);
                              openDeleteModal(school);
                            }}
                          />
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
