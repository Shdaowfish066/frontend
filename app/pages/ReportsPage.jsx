import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { reportsService } from '../services';
import { CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await reportsService.getReports(filter);
        setReports(response);
      } catch (error) {
        showError(error.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) loadReports();
  }, [currentUser, filter, showError]);

  const handleReview = async (reportId, status) => {
    try {
      const updated = await reportsService.reviewReport(reportId, status);
      setReports(prev => prev.map(report => report.id === reportId ? updated : report));
      showSuccess('Report updated');
    } catch (error) {
      showError(error.message || 'Failed to review report');
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await reportsService.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
      showSuccess('Report deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete report');
    }
  };

  const handleSelectReport = async (reportId) => {
    try {
      const report = await reportsService.getReport(reportId);
      setSelectedReport(report);
    } catch (error) {
      showError(error.message || 'Failed to load report details');
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view reports</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#F1F5F9', marginBottom: '24px' }}>Content Reports</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Reviewed', value: 'reviewed' },
          { label: 'Resolved', value: 'resolved' },
        ].map(option => (
          <button
            key={option.label}
            onClick={() => setFilter(option.value)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: filter === option.value ? '#6C63FF' : 'transparent', color: '#F1F5F9', cursor: 'pointer' }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedReport && (
        <div style={{ padding: 20, marginBottom: 24, background: '#1A1D27', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <h2 style={{ color: '#F1F5F9', margin: 0 }}>Report #{selectedReport.id}</h2>
            <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>Close</button>
          </div>
          <div style={{ display: 'grid', gap: 8, color: '#94A3B8' }}>
            <div>Status: {String(selectedReport.status).toUpperCase()}</div>
            <div>Reporter ID: {selectedReport.reporterId}</div>
            <div>Target: {selectedReport.postId ? `Post #${selectedReport.postId}` : `Comment #${selectedReport.commentId}`}</div>
            <div>Reason: {selectedReport.reason}</div>
            {selectedReport.description && <div>Description: {selectedReport.description}</div>}
            <div>Created: {new Date(selectedReport.createdAt).toLocaleString()}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#64748B' }}>Loading...</div>
      ) : reports.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#1A1D27',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CheckCircle2 size={40} color="#22C55E" style={{ margin: '0 auto', marginBottom: '16px' }} />
          <p style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: '8px' }}>No open reports</p>
          <p style={{ color: '#94A3B8' }}>Everything looks clean. Great moderation work!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map(report => (
            <div key={report.id} style={{
              padding: '20px',
              background: '#1A1D27',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: '4px' }}>
                    {report.postId ? `Post #${report.postId}` : `Comment #${report.commentId}`} Report
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: 6 }}>{report.reason}</p>
                  {report.description && <p style={{ color: '#64748B', fontSize: '13px' }}>{report.description}</p>}
                </div>
                <span style={{
                  padding: '4px 12px',
                  background: report.status === 'resolved' ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
                  color: report.status === 'resolved' ? '#22C55E' : '#F59E0B',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  {String(report.status).toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleSelectReport(report.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>View Details</button>
                  <button onClick={() => handleReview(report.id, 'reviewed')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>Mark Reviewed</button>
                  <button onClick={() => handleReview(report.id, 'resolved')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#22C55E', color: 'white', cursor: 'pointer' }}>Resolve</button>
                  <button onClick={() => handleDelete(report.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
