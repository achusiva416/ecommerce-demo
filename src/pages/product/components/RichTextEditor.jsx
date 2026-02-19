import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";
import ResizeImage from "tiptap-extension-resize-image";
import Heading from "@tiptap/extension-heading";

// ⭐ Custom Font Size Extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
    };
  },
});

const RichTextEditor = ({ content, onUpdate, placeholder, enableImageUpload = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextStyle,
      FontSize,
      Color,
      BulletList,
      OrderedList,
      ListItem,
      Image,
      ResizeImage,
      Heading.configure({ levels: [1, 2, 3] }), // ⭐ Added H1, H2, H3
    ],
    content: content || "",
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
  });

  if (!editor) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
  };

  // ⭐ Font Size Handler
  const setFontSize = (size) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  };

  return (
    <div className="rich-text-editor-container border rounded bg-light">
      <div className="toolbar p-2 bg-white border-bottom d-flex gap-2 flex-wrap">

        {/* --------- TEXT STYLES --------- */}
        <button
          className={`btn btn-sm ${editor.isActive("bold") ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleBold().run()
          }}
        >
          <i className="bi bi-type-bold"></i>
        </button>

        <button
          className={`btn btn-sm ${editor.isActive("italic") ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleItalic().run()
          }}
        >
          <i className="bi bi-type-italic"></i>
        </button>

        <button
          className={`btn btn-sm ${editor.isActive("underline") ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleUnderline().run()
          }}
        >
          <i className="bi bi-type-underline"></i>
        </button>

        {/* --------- HEADINGS H1/H2/H3 --------- */}
        <button
          className={`btn btn-sm ${editor.isActive("heading", { level: 1 }) ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }}
        >
          H1
        </button>

        <button
          className={`btn btn-sm ${editor.isActive("heading", { level: 2 }) ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
        >
          H2
        </button>

        <button
          className={`btn btn-sm ${editor.isActive("heading", { level: 3 }) ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
        >
          H3
        </button>

        {/* --------- FONT SIZE DROPDOWN --------- */}
        <select
          className="form-select form-select-sm w-auto"
          onChange={(e) => setFontSize(e.target.value)}
          defaultValue=""
        >
          <option value="">Font Size</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>

        {/* --------- LISTS --------- */}
        <button
          className={`btn btn-sm ${editor.isActive("bulletList") ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleBulletList().run()
          }}
        >
          <i className="bi bi-list-ul"></i>
        </button>

        <button
          className={`btn btn-sm ${editor.isActive("orderedList") ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            editor.chain().focus().toggleOrderedList().run()
          }}
        >
          <i className="bi bi-list-ol"></i>
        </button>

        {/* --------- IMAGE UPLOAD --------- */}
        {enableImageUpload && (
          <>
            <div className="vr"></div>
            <label className="btn btn-sm btn-outline-primary mb-0">
              <i className="bi bi-image"></i> Upload Image
              <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
            </label>
          </>
        )}
      </div>

      {/* EDITOR AREA */}
      <div className="editor-content p-3" style={{ minHeight: "250px" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
