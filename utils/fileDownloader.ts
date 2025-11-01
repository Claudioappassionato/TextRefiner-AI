import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    // Remove headings
    .replace(/^#+\s+(.*)/gm, '$1')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove blockquotes
    .replace(/^>\s?/gm, '')
    // Remove horizontal rules
    .replace(/^(\*|-|_){3,}\s*$/gm, '')
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
};

const createAndDownloadBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

export const downloadTxt = (text: string) => {
    const plainText = markdownToPlainText(text);
    const blob = new Blob([plainText], { type: 'text/plain' });
    createAndDownloadBlob(blob, 'refined-text.txt');
};

export const downloadDocx = (text: string) => {
    const plainText = markdownToPlainText(text);
    const paragraphs = plainText.split('\n').map(p => new Paragraph({
        children: [new TextRun(p)],
    }));

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        createAndDownloadBlob(blob, 'refined-text.docx');
    });
};

export const downloadPdf = (text: string) => {
    const plainText = markdownToPlainText(text);
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    
    // Set margins
    const margin = 15;
    const maxLineWidth = doc.internal.pageSize.width - margin * 2;
    const lineHeight = 7; // Corresponds to approximately 12pt font
    let y = margin;

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(plainText, maxLineWidth);

    lines.forEach((line: string) => {
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
    });

    doc.save('refined-text.pdf');
};