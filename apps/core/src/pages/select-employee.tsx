import React from 'react';
import { useState } from 'react';
import { useAuthStore } from '../../../../src/store/auth';
import { useRouter } from 'next/router';

export default function SelectEmployee() {
  const { setEmployeeNumber } = useAuthStore();
  const [value, setValue] = useState('');
  const router = useRouter();

  const handleSave = () => {
    if (value) {
      setEmployeeNumber(value);
      router.push('/apps');
    }
  };

  return (
    <div className="p-4 flex gap-2 items-end" role="form">
      <label htmlFor="emp" className="sr-only">
        Employee Number
      </label>
      <input
        id="emp"
        className="border p-2 flex-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Employee Number"
      />
      <button
        className="bg-blue-500 text-white px-3 py-2 rounded"
        onClick={handleSave}
        aria-label="Select employee"
      >
        Selecionar
      </button>
    </div>
  );
}
