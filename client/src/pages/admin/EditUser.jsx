import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import UserForm from '../../components/users/UserForm';
import api from '../../services/api';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        if (response.data.success) {
          setInitialValues(response.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to fetch user credentials.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setErrorMsg('');
    setFieldErrors([]);
    try {
      const putData = { name: formData.name, email: formData.email, phone: formData.phone };
      const requests = [api.put(`/users/${id}`, putData)];

      if (formData.status !== initialValues.status) {
        requests.push(api.patch(`/users/${id}/status`, { status: formData.status }));
      }
      if (formData.role !== initialValues.role) {
        requests.push(api.patch(`/users/${id}/role`, { role: formData.role }));
      }

      await Promise.all(requests);
      navigate('/admin/users?updated=true');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to update user account.');
      }
    } finally {
      setSubmitLoading(false);
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
            Edit User Details
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Modify core profile parameters, alter security access levels, or change activation states.
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

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="text-blue-600 animate-spin" />
              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Fetching details...</p>
            </div>
          </div>
        ) : (
          initialValues && (
            <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 sm:p-8 shadow-sm">
              <UserForm 
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isEdit={true}
                loading={submitLoading}
              />
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditUser;
