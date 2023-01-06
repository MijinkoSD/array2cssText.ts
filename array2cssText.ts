/// <reference no-default-lib="true" />
/// <reference lib="es2022" />
/// <reference lib="dom" />

/**
 * CSSで使用するスタイルを設定します。 \
 * SCSS風にセレクタを入れ子にすることも可能です。
 * - "親セレクタ"の中に"子セレクタ"を入れ子にした場合、テキスト化した後のセレクタは"親セレクタ 子セレクタ"となります。
 * - "子セレクタ"にアンパサンド(`&`)を入れた場合、全てのアンパサンドが"親セレクタ"に置換されます。
 *   - 例1：`"&子セレクタ"` -> `"親セレクタ子セレクタ"`（空白無しで連結している）
 *   - 例2：`& + &` -> "親セレクタ + 親セレクタ"
 *
 * ### 設定例
 * ```js
 * {
 *   "セレクタ": {
 *     "プロパティ": "値",
 *     "プロパティ2": "値",
 *     "子セレクタ": {
 *       "プロパティ": "値",
 *         :
 *     }
 *       :
 *   }
 * }
 * ```
 */
export interface Style {
  [K: string]: ChildStyle;
}

interface ChildStyle {
  [K: string]: number | string | ChildStyle;
}

/**
 * Style型のオブジェクトを受け取り、`<style>`要素内で使われるようなCSSのテキストに変換します
 */
export function toCSSText(style: Style): string {
  let cssText = "";
  for (const [k, v] of Object.entries(style)) {
    cssText += generateRuleText(v, k);
  }
  return cssText;
}

/** 再帰呼び出しをしたいのでCSSテキストを生成する関数を分けた */
function generateRuleText(
  style: ChildStyle,
  parentSelector?: string,
): string {
  let cssText = "";
  const innerStyles: {
    name: string;
    style: ChildStyle;
  }[] = [];
  const innerProperties: {
    name: string;
    value: number | string;
  }[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (typeof v === "number" || typeof v === "string") {
      innerProperties.push({ name: k, value: v });
    } else {
      innerStyles.push({ name: k, style: v });
    }
  }

  if (innerProperties.length > 0) {
    const selector = parentSelector;
    let defines = "";
    for (const v of innerProperties) {
      defines += `${v.name}:${v.value};`;
    }
    cssText += `${selector}{${defines}}`;
  }

  if (innerStyles.length > 0) {
    for (const v of innerStyles) {
      const selector = makeSelector(v.name, parentSelector);
      cssText += generateRuleText(v.style, selector);
    }
  }

  return cssText;
}

/**
 * セレクタ部分を生成する関数
 */
function makeSelector(selector: string, parentSelector?: string): string {
  const p = parentSelector === undefined ? "" : parentSelector.trim();
  const s = selector.trim();
  if (s.includes("&")) {
    return s.replace("&", p);
  } else {
    return p + " " + s;
  }
}
