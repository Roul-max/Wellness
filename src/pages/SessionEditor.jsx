import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Save, Globe, FileText, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState({
    title: '',
    tags: [],
    json_file_url: 'https://example.com/data/users.json',
    status: 'draft'
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    // Don't auto-save empty sessions
    if (!session.title?.trim() && !session.json_file_url?.trim() && session.tags.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.saveDraft(session);
      if (!session._id && response.session) {
        setSession(prev => ({ ...prev, _id: response.session._id }));
        // Update URL to include the new session ID
        window.history.replaceState({}, '', `/editor/${response.session._id}`);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('✨ Auto-saved', { 
        duration: 2000,
        icon: '💾'
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed', { duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  }, [session, hasUnsavedChanges, isSaving]);

  // Set up auto-save timer
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      const timer = setTimeout(() => {
        autoSave();
      }, 5000); // 5 seconds

      setAutoSaveTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [autoSave, hasUnsavedChanges, isSaving]);

  // Load existing session if editing
  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSession = async () => {
        setIsLoading(true);
        try {
          const data = await api.getSession(id);
          setSession(data);
          setTagInput(data.tags?.join(', ') || '');
          setLastSaved(new Date(data.updated_at));
        } catch (error) {
          toast.error('Failed to load session');
          navigate('/my-sessions');
        } finally {
          setIsLoading(false);
        }
      };

      fetchSession();
    }
  }, [id, navigate]);

  // Handle beforeunload to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field, value) => {
    setSession(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear existing timer to reset the 5-second countdown
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  };

  const handleTagInputChange = (value) => {
    setTagInput(value);
    const tags = value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const removeTag = (indexToRemove) => {
    const newTags = session.tags.filter((_, index) => index !== indexToRemove);
    setSession(prev => ({ ...prev, tags: newTags }));
    setTagInput(newTags.join(', '));
    setHasUnsavedChanges(true);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await api.saveDraft(session);
      if (!session._id && response.session) {
        setSession(prev => ({ ...prev, _id: response.session._id }));
        window.history.replaceState({}, '', `/editor/${response.session._id}`);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully! 📝');
    } catch (error) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Validation
    if (!session.title?.trim()) {
      toast.error('Title is required for publishing');
      return;
    }

    if (!session.json_file_url?.trim()) {
      toast.error('JSON file URL is required for publishing');
      return;
    }

    if (!validateUrl(session.json_file_url)) {
      toast.error('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setIsSaving(true);
    try {
      await api.publishSession(session);
      setHasUnsavedChanges(false);
      toast.success('🎉 Session published successfully!');
      navigate('/my-sessions');
    } catch (error) {
      toast.error(error.message || 'Failed to publish session');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    return lastSaved.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {id && id !== 'new' ? 'Edit Session' : 'Create New Session'}
            </h1>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-4 text-sm">
              {isSaving && (
                <span className="flex items-center space-x-1 text-blue-600">
                  <div className="loading-spinner"></div>
                  <span>Saving...</span>
                </span>
              )}
              
              {lastSaved && !isSaving && !hasUnsavedChanges && (
                <span className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved at {formatLastSaved()}</span>
                </span>
              )}
              
              {hasUnsavedChanges && !isSaving && (
                <span className="flex items-center space-x-1 text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span>Auto-save in 5s...</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || !session.title?.trim() || !session.json_file_url?.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="h-4 w-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                id="title"
                value={session.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="input-field"
                placeholder="Enter a descriptive title for your wellness session"
                maxLength="200"
              />
              <p className="mt-1 text-xs text-gray-500">
                {session.title?.length || 0}/200 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                className="input-field"
                placeholder="Enter tags separated by commas (e.g., yoga, meditation, relaxation)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas. Tags help users discover your session.
              </p>
              
              {/* Tag Pills */}
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {session.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(index)}
                        className="text-emerald-600 hover:text-emerald-800 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* JSON File URL */}
            <div>
              <label htmlFor="json_url" className="block text-sm font-medium text-gray-700 mb-2">
                JSON File URL *
              </label>
              <input
                type="url"
                id="json_url"
                value={session.json_file_url || ''}
                onChange={(e) => handleInputChange('json_file_url', e.target.value)}
                className={`input-field ${
                  session.json_file_url && !validateUrl(session.json_file_url) 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : ''
                }`}
                placeholder="https://example.com/path/to/session-data.json"
              />
              {session.json_file_url && !validateUrl(session.json_file_url) && (
                <div className="mt-1 flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please enter a valid URL starting with http:// or https://</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Provide a URL to your session data in JSON format. This should contain the wellness session content and configuration.
              </p>
            </div>

            {/* Publishing Requirements */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-emerald-900 mb-1">
                    Publishing Requirements
                  </h3>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li className="flex items-center space-x-2">
                      {session.title?.trim() ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Session title is required</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      {session.json_file_url?.trim() && validateUrl(session.json_file_url) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Valid JSON file URL is required</span>
                    </li>
                  </ul>
                  <p className="text-xs text-emerald-700 mt-2">
                    Save as draft to continue working on your session later, or publish to make it available to everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};