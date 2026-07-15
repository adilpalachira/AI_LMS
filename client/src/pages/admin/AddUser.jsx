import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import UserForm from '../../components/users/UserForm';
import api from '../../services/api';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setErrorMsg('');
    setFieldErrors([]);
    try {
      const response = await api.post('/users', formData);
      if (response.data.success) {
        navigate('/admin/users?created=true');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to create user account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to directory
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Add New User
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Enter details to register an administrator, faculty member, or student.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {fieldErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-1">
            <p className="text-xs font-bold text-rose-700">Please correct the following errors:</p>
            <ul className="list-disc pl-4 text-[11px] text-rose-600 font-medium">
              {fieldErrors.map((err, idx) => (
                <li key={idx}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 sm:p-8 shadow-sm">
          <UserForm 
            onSubmit={handleSubmit}
            isEdit={false}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddUser;
