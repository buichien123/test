import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), [])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'color', 'background', 'align',
    'link', 'image', 'video'
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 250px;
          font-size: 15px;
        }
        .rich-text-editor .ql-editor {
          min-height: 250px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label {
          border: 1px solid transparent;
        }
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #e5e7eb;
        }
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #e5e7eb;
        }
        .rich-text-editor .ql-toolbar.ql-snow button:hover,
        .rich-text-editor .ql-toolbar.ql-snow button:focus,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label:hover,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label.ql-active,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-item:hover,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-item.ql-selected {
          color: #2563eb;
        }
        .rich-text-editor .ql-toolbar.ql-snow button:hover,
        .rich-text-editor .ql-toolbar.ql-snow button:focus,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label:hover,
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label.ql-active {
          background-color: #eff6ff;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: #4b5563;
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: #4b5563;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button:focus .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow.ql-toolbar button:focus .ql-fill,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor

