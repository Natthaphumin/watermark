import { useRef, useState, type DragEvent } from "react";
import styles from "./ImageDropzone.module.css";

interface ImageDropzoneProps {
  onFileSelected: (file: File) => void;
}

export function ImageDropzone({ onFileSelected }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  }

  return (
    <div
      className={`${styles.dropzone} ${active ? styles.active : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <p>Drag & drop a photo here, or click to choose one</p>
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
