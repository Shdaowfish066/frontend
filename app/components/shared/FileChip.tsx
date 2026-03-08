import React, { useState } from 'react';
import { Paperclip, Download, FileText, Image, Archive, Film } from 'lucide-react';
import { FileAttachment } from '../../store/AppContext';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image size={14} />;
  if (type === 'application/pdf') return <FileText size={14} />;
  if (type.includes('zip') || type.includes('archive')) return <Archive size={14} />;
  if (type.startsWith('video/')) return <Film size={14} />;
  return <Paperclip size={14} />;
}

export function FileChip({ file, showDownload = true }: { file: FileAttachment; showDownload?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
        transition: 'all 0.2s',
        ...(hovered ? { background: 'rgba(108,99,255,0.12)', borderColor: 'rgba(108,99,255,0.4)' } : {}),
      }}
    >
      <span style={{ color: '#6C63FF' }}>{getFileIcon(file.type)}</span>
      <span style={{ color: '#F1F5F9', fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.name}
      </span>
      <span style={{ color: '#64748B', fontSize: 11 }}>{formatBytes(file.size)}</span>
      {showDownload && hovered && <Download size={12} style={{ color: '#6C63FF' }} />}
    </div>
  );
}

export function FileCard({ file }: { file: FileAttachment }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: '12px 16px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: 'rgba(108,99,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6C63FF', flexShrink: 0,
      }}>
        {React.cloneElement(getFileIcon(file.type) as React.ReactElement<any>, { size: 20 })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
        <p style={{ color: '#64748B', fontSize: 12 }}>{formatBytes(file.size)}</p>
      </div>
      <button style={{
        background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#6C63FF',
        fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <Download size={12} /> Download
      </button>
    </div>
  );
}
