import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Filter, Eye, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { EmptyState } from '../components/shared/EmptyState';

type FilterType = 'all' | 'Pending' | 'Resolved';
type ContentFilter = 'all' | 'Post' | 'User';

export default function ReportsPage() {
  const { reports, resolveReport, dismissReport } = useApp();
  const { showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  const filtered = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (contentFilter !== 'all' && r.contentType !== contentFilter) return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  const handleResolve = (id: string) => {
    resolveReport(id);
    showSuccess('Report Resolved', 'The report has been marked as resolved.');
  };

  const handleDismiss = (id: string) => {
    dismissReport(id);
    showSuccess('Report Dismissed', 'The report has been removed.');
  };

  const StatusBadge = ({ status }: { status: 'Pending' | 'Resolved' }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: status === 'Pending' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
      border: `1px solid ${status === 'Pending' ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}`,
      color: status === 'Pending' ? '#F59E0B' : '#22C55E',
      borderRadius: 24, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      {status === 'Pending' ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
      {status}
    </span>
  );

  const ContentTypeBadge = ({ type }: { type: 'Post' | 'User' }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: type === 'Post' ? 'rgba(108,99,255,0.15)' : 'rgba(56,189,248,0.15)',
      border: `1px solid ${type === 'Post' ? 'rgba(108,99,255,0.4)' : 'rgba(56,189,248,0.4)'}`,
      color: type === 'Post' ? '#6C63FF' : '#38BDF8',
      borderRadius: 24, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      {type}
    </span>
  );

  return (
    <div style={{ padding: '24px', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444',
          }}>
            <Shield size={18} />
          </div>
          <div>
            <h1 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 22 }}>Content Moderation</h1>
            <p style={{ color: '#64748B', fontSize: 13 }}>
              {pendingCount} pending report{pendingCount !== 1 ? 's' : ''} · {reports.length} total
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Filter size={14} color="#64748B" />
          {(['all', 'Pending', 'Resolved'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                background: statusFilter === f ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${statusFilter === f ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 24, padding: '5px 14px', cursor: 'pointer',
                color: statusFilter === f ? '#6C63FF' : '#64748B',
                fontSize: 12, fontWeight: statusFilter === f ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? 'All Status' : f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {(['all', 'Post', 'User'] as ContentFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setContentFilter(f)}
              style={{
                background: contentFilter === f ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${contentFilter === f ? '#38BDF8' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 24, padding: '5px 14px', cursor: 'pointer',
                color: contentFilter === f ? '#38BDF8' : '#64748B',
                fontSize: 12, fontWeight: contentFilter === f ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? 'All Types' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Reports table / cards */}
      {filtered.length === 0 ? (
        <EmptyState type="reports" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 80px 1fr 120px 120px 120px 160px',
            gap: 12, padding: '10px 16px',
            color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
          }} className="hidden md:grid">
            <span>ID</span>
            <span>Type</span>
            <span>Reason</span>
            <span>Reporter</span>
            <span>Created</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: '#1A1D27',
                borderRadius: 10, padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Mobile layout */}
              <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ContentTypeBadge type={report.contentType} />
                    <StatusBadge status={report.status} />
                  </div>
                  <span style={{ color: '#475569', fontSize: 11 }}>#{report.id.slice(0, 6)}</span>
                </div>
                <p style={{ color: '#CBD5E1', fontSize: 13 }}>{report.reason}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontSize: 12 }}>
                    by {report.reporterName} · {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </span>
                  {report.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleResolve(report.id)} style={{
                        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#22C55E', fontSize: 12,
                      }}>Resolve</button>
                      <button onClick={() => handleDismiss(report.id)} style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#64748B', fontSize: 12,
                      }}>Dismiss</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid" style={{ gridTemplateColumns: '80px 80px 1fr 120px 120px 120px 160px', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#475569', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                  #{report.id.slice(0, 6)}
                </span>
                <div><ContentTypeBadge type={report.contentType} /></div>
                <p style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 1.4 }}>{report.reason}</p>
                <span style={{ color: '#94A3B8', fontSize: 13 }}>{report.reporterName}</span>
                <span style={{ color: '#64748B', fontSize: 12 }}>
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
                <div><StatusBadge status={report.status} /></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button style={{
                    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
                    borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#6C63FF', fontSize: 11,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Eye size={11} /> View
                  </button>
                  {report.status === 'Pending' && (
                    <>
                      <button onClick={() => handleResolve(report.id)} style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#22C55E', fontSize: 11,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <CheckCircle2 size={11} /> Resolve
                      </button>
                      <button onClick={() => handleDismiss(report.id)} style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#64748B', fontSize: 11,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <XCircle size={11} /> Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}