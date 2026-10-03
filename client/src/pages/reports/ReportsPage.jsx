import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import reportService from '../../services/reportService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  Users, 
  Award, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Layers,
  ArrowUpDown,
  Building2,
  FileCheck
} from 'lucide-react';

const getReportIcon = (id) => {
  switch (id) {
    case 'STUDENT_PERFORMANCE':
      return <Users size={18} className="text-blue-600" />;
    case 'COURSE_PERFORMANCE':
      return <BookOpen size={18} className="text-indigo-600" />;
    case 'AT_RISK_STUDENTS':
      return <AlertTriangle size={18} className="text-red-600" />;
    case 'ASSIGNMENT_SUBMISSIONS':
      return <FileText size={18} className="text-purple-600" />;
    case 'QUIZ_PERFORMANCE':
      return <Award size={18} className="text-emerald-600" />;
    case 'ENROLLMENT_COMPLETION':
      return <CheckCircle2 size={18} className="text-teal-600" />;
    case 'ACADEMIC_SUMMARY':
    default:
      return <Layers size={18} className="text-gray-900" />;
  }
};

const ReportsPage = () => {
  const { user } = useAuth();

  // State
  const [catalog, setCatalog] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('STUDENT_PERFORMANCE');
  const [courses, setCourses] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    courseId: '',
    riskLevel: 'All',
    status: 'All',
    timeframe: '30d'
  });

  const [loadingReport, setLoadingReport] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchInitialCatalogAndCourses();
  }, []);

  const fetchInitialCatalogAndCourses = async () => {
    try {
      const [catalogRes, coursesRes] = await Promise.all([
        reportService.getReportCatalog(),
        api.get(user.role === 'Faculty' ? '/courses/my-courses' : '/courses')
      ]);

      if (catalogRes?.success) {
        setCatalog(catalogRes.data || []);
        if (catalogRes.data?.length > 0) {
          const firstId = catalogRes.data[0].id;
          setSelectedReportId(firstId);
          handleGenerateReport(firstId, filters);
        }
      }

      if (coursesRes.data?.success) {
        setCourses(coursesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load initial report data:', err);
    }
  };

  const handleGenerateReport = async (reportType = selectedReportId, currentFilters = filters) => {
    setLoadingReport(true);
    setTableSearch('');
    setCurrentPage(1);
    try {
      const res = await reportService.generateReport(reportType, currentFilters);
      if (res?.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await reportService.exportReportCsv(selectedReportId, filters);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Filter rows by search string
  const filteredRows = (reportData?.rows || []).filter((row) => {
    if (!tableSearch) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedReportMeta = catalog.find(r => r.id === selectedReportId) || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Hide sidebar and header during print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header />
        </div>

        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* HEADER BANNER */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:p-0 print:shadow-none">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider print:hidden">
                <FileSpreadsheet size={14} className="text-gray-900" />
                <span>Module 12 — Reports & Admin Insights</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Academic Reports & Data Exports
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Structured reporting engine for student evaluations, course completion audits, and institutional compliance.
              </p>
            </div>

            {reportData && (
              <div className="flex items-center gap-2 shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={exportingCsv || loadingReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none"
                >
                  <Download size={13} className={exportingCsv ? 'animate-bounce' : ''} />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  disabled={loadingReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none"
                >
                  <Printer size={13} />
                  Print / Save PDF
                </button>
              </div>
            )}
          </div>

          {/* REPORT TYPE SELECTOR CATALOG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
            {catalog.map((rep) => {
              const isSelected = rep.id === selectedReportId;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    handleGenerateReport(rep.id, filters);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-white border-black ring-1 ring-black shadow-sm'
                      : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      {getReportIcon(rep.id)}
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-black"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-950 truncate">
                      {rep.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
                      {rep.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DYNAMIC FILTERS BAR */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-gray-900" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Report Parameters & Filtering</h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">
                Active: <span className="text-gray-900 font-bold">{selectedReportMeta.title || 'Selected Report'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Course Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Course Filter
                </label>
                <select
                  value={filters.courseId}
                  onChange={(e) => setFilters(f => ({ ...f, courseId: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                >
                  <option value="">All Authorized Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code ? `[${c.code}] ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Level Filter (if relevant) */}
              {['STUDENT_PERFORMANCE', 'AT_RISK_STUDENTS'].includes(selectedReportId) && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Risk Classification
                  </label>
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => setFilters(f => ({ ...f, riskLevel: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="All">All Risk Tiers</option>
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                    <option value="Unevaluated">Unevaluated</option>
                  </select>
                </div>
              )}

              {/* Status Filter */}
              {['ENROLLMENT_COMPLETION', 'ASSIGNMENT_SUBMISSIONS'].includes(selectedReportId) && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Graded">Graded</option>
                  </select>
                </div>
              )}

              {/* Timeframe */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Timeframe
                </label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => setFilters(f => ({ ...f, timeframe: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Historical Records</option>
                </select>
              </div>

              {/* Generate Action Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleGenerateReport(selectedReportId, filters)}
                  disabled={loadingReport}
                  className="w-full py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} className={loadingReport ? 'animate-spin' : ''} />
                  {loadingReport ? 'Generating Report...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {/* REPORT PREVIEW & PRINTABLE CONTAINER */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:p-0 print:shadow-none">
            {/* Printable Institutional Header */}
            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    ⚡
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-950">
                    EduAI Learning Management System
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-950">
                  {reportData?.title || selectedReportMeta.title || 'Official Academic Report'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Report generated on {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString()} by {user.name} ({user.role})
                </p>
              </div>

              <div className="text-left sm:text-right text-xs font-semibold text-gray-500 space-y-0.5">
                <p><span className="text-gray-400 font-normal">Records Count:</span> <span className="text-gray-900 font-bold">{reportData?.totalRecords || 0}</span></p>
                <p><span className="text-gray-400 font-normal">Timeframe:</span> <span className="text-gray-900 font-bold">{filters.timeframe === 'all' ? 'All Time' : filters.timeframe}</span></p>
              </div>
            </div>

            {/* SUMMARY CARDS (If provided in report dataset) */}
            {reportData?.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                {Object.entries(reportData.summary).map(([k, v]) => (
                  <div key={k} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="text-base font-extrabold text-gray-950">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TABLE SEARCH BAR */}
            <div className="flex items-center justify-between gap-4 print:hidden">
              <div className="relative w-72">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in generated table..."
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Showing {paginatedRows.length} of {filteredRows.length} record(s)
              </span>
            </div>

            {/* REPORT DATA TABLE */}
            {loadingReport ? (
              <div className="py-20 text-center text-xs text-gray-400 animate-pulse space-y-2">
                <p className="font-semibold text-gray-600">Extracting database records and compiling report...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <FileCheck size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                <h4 className="text-sm font-bold text-gray-700">No records found</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  No database entries match the selected parameters. Adjust your filters and click "Generate Report".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50">
                      {(reportData?.columns || []).map((col) => (
                        <th key={col.key} className="py-3 px-3.5 font-bold">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50/70 transition-colors">
                        {(reportData?.columns || []).map((col) => {
                          const val = row[col.key];
                          const isRisk = col.key === 'riskLevel';
                          const isGrade = col.key.toLowerCase().includes('grade') || col.key.toLowerCase().includes('score');

                          return (
                            <td key={col.key} className="py-3 px-3.5 font-medium text-gray-900">
                              {isRisk ? (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  val === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  val === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  val === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {val}
                                </span>
                              ) : isGrade ? (
                                <span className="font-extrabold text-gray-950">{val}</span>
                              ) : (
                                String(val !== undefined && val !== null ? val : '—')
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION (Screen only) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500 print:hidden">
                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
