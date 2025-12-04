/**
 * XML Formatter Service
 *
 * 使用瀏覽器原生 DOMParser 解析和格式化 XML
 * 支援 CDATA、註解、屬性等特殊結構
 */

import type { FormatterError } from '../types';

export interface XMLFormatterResult {
  formattedText: string;
  error: FormatterError | null;
}

/**
 * 格式化 XML 字串
 * @param input 原始 XML 字串
 * @param indent 縮排空格數（預設 2）
 * @returns 格式化結果
 */
export function formatXML(input: string, indent: number = 2): XMLFormatterResult {
  try {
    // 移除前後空白
    const trimmed = input.trim();

    if (!trimmed) {
      return {
        formattedText: '',
        error: null,
      };
    }

    // 使用 DOMParser 解析 XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trimmed, 'text/xml');

    // 檢查解析錯誤
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      const errorText = parseError.textContent || 'XML 解析錯誤';
      return {
        formattedText: '',
        error: {
          message: errorText,
          type: 'syntax_error',
        },
      };
    }

    // 格式化 XML
    const formatted = formatXmlNode(xmlDoc.documentElement, 0, indent);

    return {
      formattedText: formatted,
      error: null,
    };
  } catch (error) {
    return {
      formattedText: '',
      error: {
        message: error instanceof Error ? error.message : 'XML 格式化失敗',
        type: 'format_error',
      },
    };
  }
}

/**
 * 遞迴格式化 XML 節點
 * @param node XML 節點
 * @param level 當前縮排層級
 * @param indentSize 縮排空格數
 * @returns 格式化的 XML 字串
 */
function formatXmlNode(node: Node, level: number, indentSize: number): string {
  const indent = ' '.repeat(level * indentSize);

  // 處理文字節點
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() || '';
    return text ? text : '';
  }

  // 處理註解節點
  if (node.nodeType === Node.COMMENT_NODE) {
    const comment = node.textContent || '';
    return `${indent}<!--${comment}-->`;
  }

  // 處理 CDATA 節點
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    const cdata = node.textContent || '';
    return `${indent}<![CDATA[${cdata}]]>`;
  }

  // 處理元素節點
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName;

    // 建立開始標籤
    let startTag = `${indent}<${tagName}`;

    // 添加屬性
    if (element.attributes.length > 0) {
      const attributes = Array.from(element.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');
      startTag += ` ${attributes}`;
    }

    // 檢查是否有子節點
    const children = Array.from(node.childNodes);

    // 過濾掉空白文字節點
    const significantChildren = children.filter(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        return child.textContent?.trim() !== '';
      }
      return true;
    });

    // 如果沒有子節點，使用自閉合標籤
    if (significantChildren.length === 0) {
      return `${startTag} />`;
    }

    // 如果只有一個文字節點，放在同一行
    if (significantChildren.length === 1 && significantChildren[0].nodeType === Node.TEXT_NODE) {
      const text = significantChildren[0].textContent?.trim() || '';
      return `${startTag}>${text}</${tagName}>`;
    }

    // 格式化子節點
    const formattedChildren = significantChildren
      .map(child => formatXmlNode(child, level + 1, indentSize))
      .filter(text => text !== '')
      .join('\n');

    // 建立結束標籤
    const endTag = `${indent}</${tagName}>`;

    return `${startTag}>\n${formattedChildren}\n${endTag}`;
  }

  return '';
}

/**
 * 解析 XML 錯誤訊息
 * @param error 錯誤物件
 * @returns FormatterError
 */
export function parseXMLError(error: unknown): FormatterError {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'syntax_error',
    };
  }

  return {
    message: 'XML 解析失敗',
    type: 'unknown_error',
  };
}
