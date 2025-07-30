import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ColorfulTextEditor = ({
  sectionKey = 'football-home-header',
  onChange,
  initialText = { title: '', paragraph: '' },
}) => {
  const [title, setTitle] = useState(initialText.title || '');
  const [paragraph, setParagraph] = useState(initialText.paragraph || '');
  const [color, setColor] = useState('#000000');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' alebo 'error'


  const titleRef = useRef(null);
  const paragraphRef = useRef(null);

  useEffect(() => {
    if (!sectionKey) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/config/section/${sectionKey}`);
        const data = response.data || {};
        setTitle(data.title || '');
        setParagraph(data.paragraph || '');
        onChange && onChange({ title: data.title || '', paragraph: data.paragraph || '' });
      } catch (error) {
        console.error('Chyba pri načítaní dát z backendu:', error);
      }
    };

    fetchData();
  }, [sectionKey, onChange]);

  const wrapSelectionAndNotify = (text, setText, textareaRef, isTitle) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const coloredText = `${before}[color=${color}]${selected}[/color]${after}`;
    setText(coloredText);

    setTimeout(() => {
      const newCursorPos = start + `[color=${color}]`.length + selected.length + `[/color]`.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);

    if (onChange) {
      if (isTitle) {
        onChange({ title: coloredText, paragraph });
      } else {
        onChange({ title, paragraph: coloredText });
      }
    }
  };


  const MAX_TITLE_LENGTH = 100;
  const MAX_PARAGRAPH_LENGTH = 300;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_TITLE_LENGTH) {
      setTitle(val);
      onChange && onChange({ title: val, paragraph });
    }
    // Ak chceš alert, tu môžeš pridať else { alert(...) }
  };

  const handleParagraphChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_PARAGRAPH_LENGTH) {
      setParagraph(val);
      onChange && onChange({ title, paragraph: val });
    }
  };


const saveToBackend = async () => {
  if (!title.trim() || !paragraph.trim()) {
    setMessage('Both fields must be filled!');
    setMessageType('error');
    hideMessageAfterDelay();
    return;
  }

  try {
    await axios.post('http://localhost:3001/api/config/section', {
      section_key: sectionKey,
      title,
      paragraph,
    });
    setMessage('Text was successfully saved.');
    setMessageType('success');
  } catch (error) {
    setMessage('Error saving the text.');
    setMessageType('error');
    console.error(error);
  } finally {
    hideMessageAfterDelay();
  }
};

const hideMessageAfterDelay = () => {
  setTimeout(() => {
    setMessage('');
    setMessageType('');
  }, 3000);
};



  // 👉 Pomocná funkcia: nahradí [color=xxx]...[/color] za <span style=...>
  const parseColoredText = (text) => {
    const pattern = /\[color=(#[0-9a-fA-F]{6}|[a-zA-Z]+)\](.*?)\[\/color\]/g;
    const parts = [];
    let lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [wholeMatch, color, content] = match;
      const index = match.index;

      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }

      parts.push(
        <span key={index} style={{ color }}>
          {content}
        </span>
      );

      lastIndex = index + wholeMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="w-full space-y-8">
      {/* Title Editor */}
      <div>
        <label className="block mb-1 lg:text-xl text-blue-100 pl-1 font-semibold">Main Title:</label>

        {/* Náhľad */}
        <div className="my-3 p-3 border-2 border-gray-400 rounded-md bg-gray-700 text-lg min-h-[120px] select-none cursor-default">
          {parseColoredText(title)}
        </div>


        <textarea
          ref={titleRef}
          rows={4} // zvýšené z 3 na 4
          value={title}
          onChange={handleTitleChange}
          className="w-full text-base p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black min-h-[10px]"
        />

        <p className={`text-sm mt-1 ${title.length > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-blue-300'}`}>
          {title.length}/{MAX_TITLE_LENGTH}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Vyber farbu"
            className="w-10 h-10 p-0 border-0 cursor-pointer"
          />
          <button
            onClick={() => wrapSelectionAndNotify(title, setTitle, titleRef, true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition"
          >
            Change Color
          </button>
        </div>
      </div>

      {/* Paragraph Editor */}
      <div>
        <label className="block mb-1 lg:text-xl text-blue-100 pl-1 font-semibold">Intro Text:</label>

        {/* Náhľad */}
        <div className="my-3 p-3 border-2 border-gray-400 rounded-md bg-gray-700 text-base min-h-[160px] select-none cursor-default">
          {parseColoredText(paragraph)}
        </div>


        <textarea
          ref={paragraphRef}
          rows={4}
          value={paragraph}
          onChange={handleParagraphChange}
          className="w-full text-base p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black min-h-[120px]"
        />

        <p className={`text-sm mt-1 ${paragraph.length > MAX_PARAGRAPH_LENGTH ? 'text-red-500' : 'text-blue-300'}`}>
          {paragraph.length}/{MAX_PARAGRAPH_LENGTH}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Vyber farbu"
            className="w-10 h-10 p-0 border-0 cursor-pointer"
          />
          <button
            onClick={() => wrapSelectionAndNotify(paragraph, setParagraph, paragraphRef, false)}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition"
          >
            Change Color
          </button>
        </div>
      </div>

      {/* Save Button */}
   <div className="text-center pb-5 pt-2 space-y-2">
  <button
    onClick={saveToBackend}
    className="px-8 py-3 font-semibold text-lg bg-green-700 hover:bg-green-600 text-white rounded-md transition"
  >
    Save Text
  </button>

  {/* Vždy zaberá miesto, aj keď je message prázdny */}
  <div
    className={`min-h-[5px] text-sm font-medium transition-all duration-300 ${
      messageType === 'success'
        ? 'text-green-400'
        : messageType === 'error'
        ? 'text-red-400'
        : 'text-transparent'
    }`}
  >
    {message || '•'} {/* „•“ pomáha zachovať výšku */}
  </div>
</div>


    </div>


  );
};

export default ColorfulTextEditor;
