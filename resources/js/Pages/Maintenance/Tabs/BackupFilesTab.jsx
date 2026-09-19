import axios from "axios";
import { useEffect, useState } from "react";
import { Archive, Download, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function BackupFilesTab() {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [runningBackup, setRunningBackup] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/backups");
            setFiles(response.data.files || []);
        } catch (err) {
            setError(t('Failed to load backup files. Please try again.'));
            console.error("Backup listing error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (file) => {
        if (deleting) return;
        if (!confirm(t('Delete backup {{0}}? This cannot be undone.', { 0: file.name }))) {
            return;
        }

        setDeleting(file.name);
        setError(null);
        try {
            await axios.delete(`/api/backups/${encodeURIComponent(file.name)}`);
            setFiles((prev) => prev.filter((item) => item.name !== file.name));
        } catch (err) {
            const message = err.response?.data?.message || t('Failed to delete backup file.');
            setError(message);
            console.error("Delete backup error:", err);
        } finally {
            setDeleting(null);
        }
    };

    const handleDownload = (file) => {
        const url = file.download_url || `/download-backup/${encodeURIComponent(file.name)}`;
        window.location.href = url;
    };

    const handleBackupNow = async () => {
        if (runningBackup) return;
        setRunningBackup(true);
        setError(null);
        try {
            const response = await axios.get("/backup-now", { responseType: "blob" });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const anchor = document.createElement("a");
            anchor.href = blobUrl;
            anchor.download = `infoshop-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
            anchor.click();
            window.URL.revokeObjectURL(blobUrl);
            await fetchFiles();
        } catch (err) {
            const message = err.response?.data?.message || err.message || t('Failed to generate backup.');
            setError(message);
            console.error("Backup now error:", err);
        } finally {
            setRunningBackup(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return t('Unknown');
        try {
            return new Date(value).toLocaleString(globalThis.document?.documentElement?.lang || undefined);
        } catch (error) {
            return value;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                <Archive className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-teal-900">{t('Backup Files')}</p>
                    <p className="text-xs text-teal-700 mt-1">
                        {t('Review previously generated backups, download copies, or delete old archives to reclaim disk space.')}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleBackupNow}
                    disabled={runningBackup}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {runningBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {t('Backup Now')}
                </button>
                <button
                    onClick={fetchFiles}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t('Refresh List')}
                </button>
                <div className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    {t('{{count}} backup available', { count: files.length })}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-600">{t('Loading backups...')}</span>
                </div>
            ) : files.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Archive className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">{t('No backups found')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('Use automation or manual backup tools to create one.')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {files.map((file) => (
                        <div
                            key={file.name}
                            className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 break-words">{file.name}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {t('{{0}} • Updated {{1}}', { 0: file.size_human, 1: formatDate(file.last_modified) })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(file)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('Download')}
                                </button>
                                <button
                                    onClick={() => handleDelete(file)}
                                    disabled={deleting === file.name}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                                >
                                    {deleting === file.name ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
