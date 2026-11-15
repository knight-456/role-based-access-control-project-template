import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { StandardRole, RoleFormData } from '../../../core/types';
import { extractFieldErrors } from '../../../core/api/httpClient';
import { RBAC_CONSTANTS } from '../../../constants';

export interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<any>;
  initialData?: StandardRole | null;
  entities?: Array<{ id: string | number; name: string }>;
  departments?: Array<{ id: string | number; name: string }>;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  entities = [],
  departments = [],
}) => {
  const i18n = RBAC_CONSTANTS.i18n;
  const [formData, setFormData] = useState<RoleFormData>({
    role_name: '',
    role_key: '',
    description: '',
    entityId: '',
    departmentId: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        role_name: initialData.name,
        role_key: initialData.key,
        description: initialData.description || '',
        entityId: initialData.entityId || '',
        departmentId: initialData.departmentId || '',
        is_active: initialData.isActive,
      });
    } else {
      setFormData({
        role_name: '',
        role_key: '',
        description: '',
        entityId: '',
        departmentId: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const autoGenerateKey = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev: RoleFormData) => ({
      ...prev,
      role_name: name,
      // Auto-populate key only on create mode
      ...(!initialData ? { role_key: autoGenerateKey(name) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.role_name.trim()) newErrors.role_name = 'Role Name is required';
    if (!formData.role_key.trim()) newErrors.role_key = 'Role Key is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      const fieldErrors = err.fieldErrors || extractFieldErrors(err.data);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setErrors({ form: err.message || 'Failed to save role' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Role' : 'Create New Role'}
      description="Define role identifier, description, and optional entity/department scope."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
            {errors.form}
          </div>
        )}

        <Input
          label="Role Name *"
          placeholder="e.g. Finance Auditor"
          value={formData.role_name}
          onChange={handleNameChange}
          error={errors.role_name}
        />

        <Input
          label="Role Key *"
          placeholder="e.g. finance_auditor"
          value={formData.role_key}
          onChange={(e) => setFormData((p: RoleFormData) => ({ ...p, role_key: e.target.value }))}
          error={errors.role_key}
          disabled={Boolean(initialData)} // Immutable key on edit for safety
          helperText="Unique identifier used for code-level permission evaluations."
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Describe role responsibilities..."
            value={formData.description}
            onChange={(e) => setFormData((p: RoleFormData) => ({ ...p, description: e.target.value }))}
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28518F]"
          />
        </div>

        {/* Optional Multi-Entity / Department scoping */}
        <div className="grid grid-cols-2 gap-3">
          {entities.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entity Scope</label>
              <select
                value={formData.entityId || ''}
                onChange={(e) => setFormData((p: RoleFormData) => ({ ...p, entityId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">Global (All Entities)</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {departments.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department Scope</label>
              <select
                value={formData.departmentId || ''}
                onChange={(e) => setFormData((p: RoleFormData) => ({ ...p, departmentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="role-status"
            checked={formData.is_active}
            onChange={(e) => setFormData((p: RoleFormData) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F]"
          />
          <label htmlFor="role-status" className="text-sm text-gray-700 cursor-pointer">
            Role is Active
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            {i18n.cancel}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? i18n.saveChanges : i18n.create}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
