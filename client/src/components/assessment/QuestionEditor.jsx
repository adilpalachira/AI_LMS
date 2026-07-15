import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const QuestionEditor = ({ initialData, onSave, onCancel, loading = false }) => {
  const [questionText, setQuestionText] = useState(initialData?.question || '');
  const [type, setType] = useState(initialData?.type || 'Multiple Choice');
  const [options, setOptions] = useState(initialData?.options?.length ? initialData.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer !== undefined ? String(initialData.correctAnswer) : 'Option 1');
  const [marks, setMarks] = useState(initialData?.marks || 1);
  const [explanation, setExplanation] = useState(initialData?.explanation || '');

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) {
      alert('Multiple Choice question must have at least 2 options');
      return;
    }
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctAnswer === options[idx]) {
      setCorrectAnswer(updated[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Question text is required');
      return;
    }

    const payload = {
      question: questionText,
      type,
      marks: parseInt(marks) || 1,
      explanation,
      options: type === 'Multiple Choice' ? options : type === 'True/False' ? ['True', 'False'] : [],
      correctAnswer: type === 'True/False' ? (correctAnswer.toLowerCase() === 'true' ? 'True' : 'False') : correctAnswer
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-150 pb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle size={18} className="text-blue-600" />
          {initialData ? 'Edit Question' : 'Add New Question'}
        </h4>
        <span className="text-xs font-bold text-gray-500 font-mono">Type: {type}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Question Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Enter question statement..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="premium-input text-xs"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Question Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value === 'True/False') setCorrectAnswer('True');
                else if (e.target.value === 'Multiple Choice') setCorrectAnswer(options[0]);
              }}
              className="premium-input text-xs"
            >
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True/False">True / False</option>
              <option value="Short Answer">Short Answer</option>
              <option value="Essay">Essay Question</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Question Marks</label>
            <input
              type="number"
              min={1}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="premium-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Multiple Choice Options Builder */}
      {type === 'Multiple Choice' && (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-gray-700">Answer Options & Correct Key</label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctAnswer === opt}
                  onChange={() => setCorrectAnswer(opt)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="premium-input text-xs flex-1"
                  placeholder={`Option ${idx + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
          >
            <Plus size={14} /> Add Another Option
          </button>
        </div>
      )}

      {/* True / False Selector */}
      {type === 'True/False' && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-gray-700">Correct Answer</label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="radio"
                name="tfAnswer"
                checked={correctAnswer === 'True'}
                onChange={() => setCorrectAnswer('True')}
                className="w-4 h-4 text-blue-600"
              />
              True
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="radio"
                name="tfAnswer"
                checked={correctAnswer === 'False'}
                onChange={() => setCorrectAnswer('False')}
                className="w-4 h-4 text-blue-600"
              />
              False
            </label>
          </div>
        </div>
      )}

      {/* Short Answer / Essay Key Input */}
      {(type === 'Short Answer' || type === 'Essay') && (
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Sample Answer / Evaluation Criteria <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="Expected answer key or evaluation criteria..."
            className="premium-input text-xs"
          />
        </div>
      )}

      {/* Explanation text */}
      <div className="pt-2">
        <label className="block text-xs font-bold text-gray-700 mb-1">Answer Explanation / Feedback</label>
        <input
          type="text"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explanation shown after quiz submission..."
          className="premium-input text-xs"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-150">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-xs"
        >
          {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          Save Question
        </button>
      </div>
    </form>
  );
};

export default QuestionEditor;
