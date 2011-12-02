var TextParser = Editor.Parser = (function() {
  function tokenizeText(source) {
    while (!source.endOfLine()) source.next();
    return "text";
  }
  function parseText(source) {
    function indentTo(n) {return function() {return n;}}
    source = tokenizer(source, tokenizeText);
    var space = 0;

    var iter = {
      next: function() {
        var tok = source.next();
        if (tok.type == "whitespace") {
          if (tok.value == "\n") tok.indentation = indentTo(space);
          else space = tok.value.length;
        }
        return tok;
      },
      copy: function() {
        var _space = space;
        return function(_source) {
          space = _space;
          source = tokenizer(_source, tokenizeText);
          return iter;
        };
      }
    };
    return iter;
  }
  return {make: parseText};
})();
/* This file defines an XML parser, with a few kludges to make it
 * useable for HTML. autoSelfClosers defines a set of tag names that
 * are expected to not have a closing tag, and doNotIndent specifies
 * the tags inside of which no indentation should happen (see Config
 * object). These can be disabled by passing the editor an object like
 * {useHTMLKludges: false} as parserConfig option.
 */

var XMLParser = Editor.Parser = (function() {
  var Kludges = {
    autoSelfClosers: {"br": true, "img": true, "hr": true, "link": true, "input": true,
                      "meta": true, "col": true, "frame": true, "base": true, "area": true},
    doNotIndent: {"pre": true, "!cdata": true}
  };
  var NoKludges = {autoSelfClosers: {}, doNotIndent: {"!cdata": true}};
  var UseKludges = Kludges;
  var alignCDATA = false;

  // Simple stateful tokenizer for XML documents. Returns a
  // MochiKit-style iterator, with a state property that contains a
  // function encapsulating the current state. See tokenize.js.
  var tokenizeXML = (function() {
    function inText(source, setState) {
      var ch = source.next();
      if (ch == "<") {
        if (source.equals("!")) {
          source.next();
          if (source.equals("[")) {
            if (source.lookAhead("[CDATA[", true)) {
              setState(inBlock("xml-cdata", "]]>"));
              return null;
            }
            else {
              return "xml-text";
            }
          }
          else if (source.lookAhead("--", true)) {
            setState(inBlock("xml-comment", "-->"));
            return null;
          }
          else if (source.lookAhead("DOCTYPE", true)) {
            source.nextWhileMatches(/[\w\._\-]/);
            setState(inBlock("xml-doctype", ">"));
            return "xml-doctype";
          }
          else {
            return "xml-text";
          }
        }
        else if (source.equals("?")) {
          source.next();
          source.nextWhileMatches(/[\w\._\-]/);
          setState(inBlock("xml-processing", "?>"));
          return "xml-processing";
        }
        else {
          if (source.equals("/")) source.next();
          setState(inTag);
          return "xml-punctuation";
        }
      }
      else if (ch == "&") {
        while (!source.endOfLine()) {
          if (source.next() == ";")
            break;
        }
        return "xml-entity";
      }
      else {
        source.nextWhileMatches(/[^&<\n]/);
        return "xml-text";
      }
    }

    function inTag(source, setState) {
      var ch = source.next();
      if (ch == ">") {
        setState(inText);
        return "xml-punctuation";
      }
      else if (/[?\/]/.test(ch) && source.equals(">")) {
        source.next();
        setState(inText);
        return "xml-punctuation";
      }
      else if (ch == "=") {
        return "xml-punctuation";
      }
      else if (/[\'\"]/.test(ch)) {
        setState(inAttribute(ch));
        return null;
      }
      else {
        source.nextWhileMatches(/[^\s\u00a0=<>\"\'\/?]/);
        return "xml-name";
      }
    }

    function inAttribute(quote) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          if (source.next() == quote) {
            setState(inTag);
            break;
          }
        }
        return "xml-attribute";
      };
    }

    function inBlock(style, terminator) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          if (source.lookAhead(terminator, true)) {
            setState(inText);
            break;
          }
          source.next();
        }
        return style;
      };
    }

    return function(source, startState) {
      return tokenizer(source, startState || inText);
    };
  })();

  // The parser. The structure of this function largely follows that of
  // parseJavaScript in parsejavascript.js (there is actually a bit more
  // shared code than I'd like), but it is quite a bit simpler.
  function parseXML(source) {
    var tokens = tokenizeXML(source), token;
    var cc = [base];
    var tokenNr = 0, indented = 0;
    var currentTag = null, context = null;
    var consume;
    
    function push(fs) {
      for (var i = fs.length - 1; i >= 0; i--)
        cc.push(fs[i]);
    }
    function cont() {
      push(arguments);
      consume = true;
    }
    function pass() {
      push(arguments);
      consume = false;
    }

    function markErr() {
      token.style += " xml-error";
    }
    function expect(text) {
      return function(style, content) {
        if (content == text) cont();
        else {markErr(); cont(arguments.callee);}
      };
    }

    function pushContext(tagname, startOfLine) {
      var noIndent = UseKludges.doNotIndent.hasOwnProperty(tagname) || (context && context.noIndent);
      context = {prev: context, name: tagname, indent: indented, startOfLine: startOfLine, noIndent: noIndent};
    }
    function popContext() {
      context = context.prev;
    }
    function computeIndentation(baseContext) {
      return function(nextChars, current) {
        var context = baseContext;
        if (context && context.noIndent)
          return current;
        if (alignCDATA && /<!\[CDATA\[/.test(nextChars))
          return 0;
        if (context && /^<\//.test(nextChars))
          context = context.prev;
        while (context && !context.startOfLine)
          context = context.prev;
        if (context)
          return context.indent + indentUnit;
        else
          return 0;
      };
    }

    function base() {
      return pass(element, base);
    }
    var harmlessTokens = {"xml-text": true, "xml-entity": true, "xml-comment": true, "xml-processing": true, "xml-doctype": true};
    function element(style, content) {
      if (content == "<") cont(tagname, attributes, endtag(tokenNr == 1));
      else if (content == "</") cont(closetagname, expect(">"));
      else if (style == "xml-cdata") {
        if (!context || context.name != "!cdata") pushContext("!cdata");
        if (/\]\]>$/.test(content)) popContext();
        cont();
      }
      else if (harmlessTokens.hasOwnProperty(style)) cont();
      else {markErr(); cont();}
    }
    function tagname(style, content) {
      if (style == "xml-name") {
        currentTag = content.toLowerCase();
        token.style = "xml-tagname";
        cont();
      }
      else {
        currentTag = null;
        pass();
      }
    }
    function closetagname(style, content) {
      if (style == "xml-name") {
        token.style = "xml-tagname";
        if (context && content.toLowerCase() == context.name) popContext();
        else markErr();
      }
      cont();
    }
    function endtag(startOfLine) {
      return function(style, content) {
        if (content == "/>" || (content == ">" && UseKludges.autoSelfClosers.hasOwnProperty(currentTag))) cont();
        else if (content == ">") {pushContext(currentTag, startOfLine); cont();}
        else {markErr(); cont(arguments.callee);}
      };
    }
    function attributes(style) {
      if (style == "xml-name") {token.style = "xml-attname"; cont(attribute, attributes);}
      else pass();
    }
    function attribute(style, content) {
      if (content == "=") cont(value);
      else if (content == ">" || content == "/>") pass(endtag);
      else pass();
    }
    function value(style) {
      if (style == "xml-attribute") cont(value);
      else pass();
    }

    return {
      indentation: function() {return indented;},

      next: function(){
        token = tokens.next();
        if (token.style == "whitespace" && tokenNr == 0)
          indented = token.value.length;
        else
          tokenNr++;
        if (token.content == "\n") {
          indented = tokenNr = 0;
          token.indentation = computeIndentation(context);
        }

        if (token.style == "whitespace" || token.type == "xml-comment")
          return token;

        while(true){
          consume = false;
          cc.pop()(token.style, token.content);
          if (consume) return token;
        }
      },

      copy: function(){
        var _cc = cc.concat([]), _tokenState = tokens.state, _context = context;
        var parser = this;
        
        return function(input){
          cc = _cc.concat([]);
          tokenNr = indented = 0;
          context = _context;
          tokens = tokenizeXML(input, _tokenState);
          return parser;
        };
      }
    };
  }

  return {
    make: parseXML,
    electricChars: "/",
    configure: function(config) {
      if (config.useHTMLKludges != null)
        UseKludges = config.useHTMLKludges ? Kludges : NoKludges;
      if (config.alignCDATA)
        alignCDATA = config.alignCDATA;
    }
  };
})();
/* Simple parser for CSS */

var CSSParser = Editor.Parser = (function() {
  var properties = "-moz-box-sizing|-webkit-box-sizing|azimuth|background-attachment|background-color|background-image|" +
        "background-position|background-repeat|background|border-bottom-color|" +
        "border-bottom-style|border-bottom-width|border-bottom|border-collapse|" +
        "border-color|border-left-color|border-left-style|border-left-width|" +
        "border-left|border-right-color|border-right-style|border-right-width|" +
        "border-right|border-spacing|border-style|border-top-color|" +
        "border-top-style|border-top-width|border-top|border-width|border|" +
        "bottom|box-sizing|caption-side|clear|clip|color|content|counter-increment|" +
        "counter-reset|cue-after|cue-before|cue|cursor|direction|display|" +
        "elevation|empty-cells|float|font-family|font-size-adjust|font-size|" +
        "font-stretch|font-style|font-variant|font-weight|font|height|left|" +
        "letter-spacing|line-height|list-style-image|list-style-position|" +
        "list-style-type|list-style|margin-bottom|margin-left|margin-right|" +
        "margin-top|marker-offset|margin|marks|max-height|max-width|min-height|" +
        "min-width|-moz-border-radius|opacity|orphans|outline-color|" +
        "outline-style|outline-width|outline|overflow|overflow-x|overflow-y|padding-bottom|" +
        "padding-left|padding-right|padding-top|padding|page-break-after|" +
        "page-break-before|page-break-inside|page|pause-after|pause-before|" +
        "pause|pitch-range|pitch|play-during|position|quotes|richness|right|" +
        "size|speak-header|speak-numeral|speak-punctuation|speech-rate|speak|" +
        "stress|table-layout|text-align|text-decoration|text-indent|" +
        "text-shadow|text-transform|top|unicode-bidi|vertical-align|" +
        "visibility|voice-family|volume|white-space|widows|width|word-spacing|" +
        "z-index";
  
  var constants = "absolute|all-scroll|always|armenian|auto|baseline|below|bidi-override|" +
        "block|bold|bolder|border-box|both|bottom|break-all|break-word|capitalize|center|" +
        "char|circle|cjk-ideographic|col-resize|collapse|content-box|crosshair|dashed|" +
        "decimal-leading-zero|decimal|default|disabled|disc|" +
        "distribute-all-lines|distribute-letter|distribute-space|" +
        "distribute|dotted|double|e-resize|ellipsis|fixed|georgian|groove|" +
        "hand|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|" +
        "ideograph-alpha|ideograph-numeric|ideograph-parenthesis|" +
        "ideograph-space|inactive|inherit|inline-block|inline|inset|inside|" +
        "inter-ideograph|inter-word|italic|justify|katakana-iroha|katakana|" +
        "keep-all|left|lighter|line-edge|line-through|line|list-item|loose|" +
        "lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|" +
        "medium|middle|move|n-resize|ne-resize|newspaper|no-drop|no-repeat|" +
        "nw-resize|none|normal|not-allowed|nowrap|oblique|outset|outside|" +
        "overline|pointer|progress|relative|repeat-x|repeat-y|repeat|right|" +
        "ridge|row-resize|rtl|s-resize|scroll|se-resize|separate|small-caps|" +
        "solid|square|static|strict|super|sw-resize|table-footer-group|" +
        "table-header-group|tb-rl|text-bottom|text-top|text|thick|thin|top|" +
        "transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|" +
        "vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|" +
        "zero";
  
  var colors = "aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|" +
        "purple|red|silver|teal|white|yellow";
        
  var tokenizeCSS = (function() {
    function normal(source, setState) {
      var ch = source.next();
      if (ch == "@") {
        source.nextWhileMatches(/\w/);
        return "css-at";
      }
      else if (ch == "/" && source.equals("*")) {
        setState(inCComment);
        return null;
      }
      else if (ch == "<" && source.equals("!")) {
        setState(inSGMLComment);
        return null;
      }
      else if (ch == "=") {
        return "css-compare";
      }
      else if (source.equals("=") && (ch == "~" || ch == "|")) {
        source.next();
        return "css-compare";
      }
      else if (ch == "\"" || ch == "'") {
        setState(inString(ch));
        return null;
      }
      else if (ch == "#") {
        source.nextWhileMatches(/\w/);
        return "css-hash";
      }
      else if (ch == "!") {
        source.nextWhileMatches(/[ \t]/);
        source.nextWhileMatches(/\w/);
        return "css-important";
      }
      else if (/\d/.test(ch)) {
        source.nextWhileMatches(/[\w.%]/);
        return "css-unit";
      }
      else if (/[,.+>*\/]/.test(ch)) {
        return "css-select-op";
      }
      else if (/[;{}:\[\]]/.test(ch)) {
        return "css-punctuation";
      } else if(ch.indexOf(properties) != -1) {
      	return "css-property";
      } else if(ch.indexOf(constants) != -1) {
      	return "css-constant";
      }
      else {
        source.nextWhileMatches(/[\w\\\-_]/);
        return "css-identifier";
      }
    }

    function inCComment(source, setState) {
      var maybeEnd = false;
      while (!source.endOfLine()) {
        var ch = source.next();
        if (maybeEnd && ch == "/") {
          setState(normal);
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "css-comment";
    }

    function inSGMLComment(source, setState) {
      var dashes = 0;
      while (!source.endOfLine()) {
        var ch = source.next();
        if (dashes >= 2 && ch == ">") {
          setState(normal);
          break;
        }
        dashes = (ch == "-") ? dashes + 1 : 0;
      }
      return "css-comment";
    }

    function inString(quote) {
      return function(source, setState) {
        var escaped = false;
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == quote && !escaped)
            break;
          escaped = !escaped && ch == "\\";
        }
        if (!escaped)
          setState(normal);
        return "css-string";
      };
    }

    return function(source, startState) {
      return tokenizer(source, startState || normal);
    };
  })();

  function indentCSS(inBraces, inRule, base) {
    return function(nextChars) {
      if (!inBraces || /^\}/.test(nextChars)) return base;
      else if (inRule) return base + indentUnit * 2;
      else return base + indentUnit;
    };
  }

  // This is a very simplistic parser -- since CSS does not really
  // nest, it works acceptably well, but some nicer colouroing could
  // be provided with a more complicated parser.
  function parseCSS(source, basecolumn) {
    basecolumn = basecolumn || 0;
    var tokens = tokenizeCSS(source);
    var inBraces = false, inRule = false, inDecl = false;;

    var iter = {
      next: function() {
        var token = tokens.next(), style = token.style, content = token.content;

        if (style == "css-hash")
          style = token.style =  inRule ? "css-colorcode" : "css-identifier";
        if (style == "css-identifier") {
          if (inRule) {
          	if (new RegExp(constants).test(content)) {
          		token.style = "css-constant";
          	} else if (new RegExp(properties).test(content)) {
          		token.style = "css-property";
          	} else if (new RegExp(colors).test(content)) {
          		token.style = "css-property";
          	} else {
          		token.style = "css-value";
          	}
          	
          }
          else if (!inBraces && !inDecl) token.style = "css-selector";
        }

        if (content == "\n")
          token.indentation = indentCSS(inBraces, inRule, basecolumn);

        if (content == "{" && inDecl == "@media")
          inDecl = false;
        else if (content == "{")
          inBraces = true;
        else if (content == "}")
          inBraces = inRule = inDecl = false;
        else if (content == ";")
          inRule = inDecl = false;
        else if (inBraces && style != "css-comment" && style != "whitespace")
          inRule = true;
        else if (!inBraces && style == "css-at")
          inDecl = content;

        return token;
      },

      copy: function() {
        var _inBraces = inBraces, _inRule = inRule, _tokenState = tokens.state;
        return function(source) {
          tokens = tokenizeCSS(source, _tokenState);
          inBraces = _inBraces;
          inRule = _inRule;
          return iter;
        };
      }
    };
    return iter;
  }

  return {make: parseCSS, electricChars: "}"};
})();
/* Tokenizer for JavaScript code */

var tokenizeJavaScript = (function() {
  // Advance the stream until the given character (not preceded by a
  // backslash) is encountered, or the end of the line is reached.
  function nextUntilUnescaped(source, end) {
    var escaped = false;
    while (!source.endOfLine()) {
      var next = source.next();
      if (next == end && !escaped)
        return false;
      escaped = !escaped && next == "\\";
    }
    return escaped;
  }

  // A map of JavaScript's keywords. The a/b/c keyword distinction is
  // very rough, but it gives the parser enough information to parse
  // correct code correctly (we don't care that much how we parse
  // incorrect code). The style information included in these objects
  // is used by the highlighter to pick the correct CSS style for a
  // token.
  var keywords = function(){
    function result(type, style){
      return {type: type, style: "js-" + style};
    }
    // keywords that take a parenthised expression, and then a
    // statement (if)
    var keywordA = result("keyword a", "keyword");
    // keywords that take just a statement (else)
    var keywordB = result("keyword b", "keyword");
    // keywords that optionally take an expression, and form a
    // statement (return)
    var keywordC = result("keyword c", "keyword");
    var operator = result("operator", "keyword");
    var atom = result("atom", "atom");
    return {
      "if": keywordA, "while": keywordA, "with": keywordA,
      "else": keywordB, "do": keywordB, "try": keywordB, "finally": keywordB,
      "return": keywordC, "break": keywordC, "continue": keywordC, "new": keywordC, "delete": keywordC, "throw": keywordC,
      "in": operator, "typeof": operator, "instanceof": operator,
      "var": result("var", "keyword"), "function": result("function", "keyword"), "catch": result("catch", "keyword"),
      "for": result("for", "keyword"), "switch": result("switch", "keyword"),
      "case": result("case", "keyword"), "default": result("default", "keyword"),
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom
    };
  }();

  // Some helper regexps
  var isOperatorChar = /[+\-*&%=<>!?|]/;
  var isHexDigit = /[0-9A-Fa-f]/;
  var isWordChar = /[\w\$_]/;

  // Wrapper around jsToken that helps maintain parser state (whether
  // we are inside of a multi-line comment and whether the next token
  // could be a regular expression).
  function jsTokenState(inside, regexp) {
    return function(source, setState) {
      var newInside = inside;
      var type = jsToken(inside, regexp, source, function(c) {newInside = c;});
      var newRegexp = type.type == "operator" || type.type == "keyword c" || type.type.match(/^[\[{}\(,;:]$/);
      if (newRegexp != regexp || newInside != inside)
        setState(jsTokenState(newInside, newRegexp));
      return type;
    };
  }

  // The token reader, intended to be used by the tokenizer from
  // tokenize.js (through jsTokenState). Advances the source stream
  // over a token, and returns an object containing the type and style
  // of that token.
  function jsToken(inside, regexp, source, setInside) {
    function readHexNumber(){
      source.next(); // skip the 'x'
      source.nextWhileMatches(isHexDigit);
      return {type: "number", style: "js-atom"};
    }

    function readNumber() {
      source.nextWhileMatches(/[0-9]/);
      if (source.equals(".")){
        source.next();
        source.nextWhileMatches(/[0-9]/);
      }
      if (source.equals("e") || source.equals("E")){
        source.next();
        if (source.equals("-"))
          source.next();
        source.nextWhileMatches(/[0-9]/);
      }
      return {type: "number", style: "js-atom"};
    }
    // Read a word, look it up in keywords. If not found, it is a
    // variable, otherwise it is a keyword of the type found.
    function readWord() {
      source.nextWhileMatches(isWordChar);
      var word = source.get();
      var known = keywords.hasOwnProperty(word) && keywords.propertyIsEnumerable(word) && keywords[word];
      return known ? {type: known.type, style: known.style, content: word} :
      {type: "variable", style: "js-variable", content: word};
    }
    function readRegexp() {
      nextUntilUnescaped(source, "/");
      source.nextWhileMatches(/[gimy]/); // 'y' is "sticky" option in Mozilla
      return {type: "regexp", style: "js-string"};
    }
    // Mutli-line comments are tricky. We want to return the newlines
    // embedded in them as regular newline tokens, and then continue
    // returning a comment token for every line of the comment. So
    // some state has to be saved (inside) to indicate whether we are
    // inside a /* */ sequence.
    function readMultilineComment(start){
      var newInside = "/*";
      var maybeEnd = (start == "*");
      while (true) {
        if (source.endOfLine())
          break;
        var next = source.next();
        if (next == "/" && maybeEnd){
          newInside = null;
          break;
        }
        maybeEnd = (next == "*");
      }
      setInside(newInside);
      return {type: "comment", style: "js-comment"};
    }
    function readOperator() {
      source.nextWhileMatches(isOperatorChar);
      return {type: "operator", style: "js-operator"};
    }
    function readString(quote) {
      var endBackSlash = nextUntilUnescaped(source, quote);
      setInside(endBackSlash ? quote : null);
      return {type: "string", style: "js-string"};
    }

    // Fetch the next token. Dispatches on first character in the
    // stream, or first two characters when the first is a slash.
    if (inside == "\"" || inside == "'")
      return readString(inside);
    var ch = source.next();
    if (inside == "/*")
      return readMultilineComment(ch);
    else if (ch == "\"" || ch == "'")
      return readString(ch);
    // with punctuation, the type of the token is the symbol itself
    else if (/[\[\]{}\(\),;\:\.]/.test(ch))
      return {type: ch, style: "js-punctuation"};
    else if (ch == "0" && (source.equals("x") || source.equals("X")))
      return readHexNumber();
    else if (/[0-9]/.test(ch))
      return readNumber();
    else if (ch == "/"){
      if (source.equals("*"))
      { source.next(); return readMultilineComment(ch); }
      else if (source.equals("/"))
      { nextUntilUnescaped(source, null); return {type: "comment", style: "js-comment"};}
      else if (regexp)
        return readRegexp();
      else
        return readOperator();
    }
    else if (isOperatorChar.test(ch))
      return readOperator();
    else
      return readWord();
  }

  // The external interface to the tokenizer.
  return function(source, startState) {
    return tokenizer(source, startState || jsTokenState(false, true));
  };
})();
/* Parse function for JavaScript. Makes use of the tokenizer from
 * tokenizejavascript.js. Note that your parsers do not have to be
 * this complicated -- if you don't want to recognize local variables,
 * in many languages it is enough to just look for braces, semicolons,
 * parentheses, etc, and know when you are inside a string or comment.
 *
 * See manual.html for more info about the parser interface.
 */

var JSParser = Editor.Parser = (function() {
  // Token types that can be considered to be atoms.
  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true};
  // Setting that can be used to have JSON data indent properly.
  var json = false;
  // Constructor for the lexical context objects.
  function JSLexical(indented, column, type, align, prev, info) {
    // indentation at start of this line
    this.indented = indented;
    // column at which this scope was opened
    this.column = column;
    // type of scope ('vardef', 'stat' (statement), 'form' (special form), '[', '{', or '(')
    this.type = type;
    // '[', '{', or '(' blocks that have any text after their opening
    // character are said to be 'aligned' -- any lines below are
    // indented all the way to the opening character.
    if (align != null)
      this.align = align;
    // Parent scope, if any.
    this.prev = prev;
    this.info = info;
  }

  // My favourite JavaScript indentation rules.
  function indentJS(lexical) {
    return function(firstChars) {
      var firstChar = firstChars && firstChars.charAt(0), type = lexical.type;
      var closing = firstChar == type;
      if (type == "vardef")
        return lexical.indented + 4;
      else if (type == "form" && firstChar == "{")
        return lexical.indented;
      else if (type == "stat" || type == "form")
        return lexical.indented + indentUnit;
      else if (lexical.info == "switch" && !closing)
        return lexical.indented + (/^(?:case|default)\b/.test(firstChars) ? indentUnit : 2 * indentUnit);
      else if (lexical.align)
        return lexical.column - (closing ? 1 : 0);
      else
        return lexical.indented + (closing ? 0 : indentUnit);
    };
  }

  // The parser-iterator-producing function itself.
  function parseJS(input, basecolumn) {
    // Wrap the input in a token stream
    var tokens = tokenizeJavaScript(input);
    // The parser state. cc is a stack of actions that have to be
    // performed to finish the current statement. For example we might
    // know that we still need to find a closing parenthesis and a
    // semicolon. Actions at the end of the stack go first. It is
    // initialized with an infinitely looping action that consumes
    // whole statements.
    var cc = [json ? expressions : statements];
    // Context contains information about the current local scope, the
    // variables defined in that, and the scopes above it.
    var context = null;
    // The lexical scope, used mostly for indentation.
    var lexical = new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false);
    // Current column, and the indentation at the start of the current
    // line. Used to create lexical scope objects.
    var column = 0;
    var indented = 0;
    // Variables which are used by the mark, cont, and pass functions
    // below to communicate with the driver loop in the 'next'
    // function.
    var consume, marked;
  
    // The iterator object.
    var parser = {next: next, copy: copy};

    function next(){
      // Start by performing any 'lexical' actions (adjusting the
      // lexical variable), or the operations below will be working
      // with the wrong lexical state.
      while(cc[cc.length - 1].lex)
        cc.pop()();

      // Fetch a token.
      var token = tokens.next();

      // Adjust column and indented.
      if (token.type == "whitespace" && column == 0)
        indented = token.value.length;
      column += token.value.length;
      if (token.content == "\n"){
        indented = column = 0;
        // If the lexical scope's align property is still undefined at
        // the end of the line, it is an un-aligned scope.
        if (!("align" in lexical))
          lexical.align = false;
        // Newline tokens get an indentation function associated with
        // them.
        token.indentation = indentJS(lexical);
      }
      // No more processing for meaningless tokens.
      if (token.type == "whitespace" || token.type == "comment")
        return token;
      // When a meaningful token is found and the lexical scope's
      // align is undefined, it is an aligned scope.
      if (!("align" in lexical))
        lexical.align = true;

      // Execute actions until one 'consumes' the token and we can
      // return it.
      while(true) {
        consume = marked = false;
        // Take and execute the topmost action.
        cc.pop()(token.type, token.content);
        if (consume){
          // Marked is used to change the style of the current token.
          if (marked)
            token.style = marked;
          // Here we differentiate between local and global variables.
          else if (token.type == "variable" && inScope(token.content))
            token.style = "js-localvariable";
          return token;
        }
      }
    }

    // This makes a copy of the parser state. It stores all the
    // stateful variables in a closure, and returns a function that
    // will restore them when called with a new input stream. Note
    // that the cc array has to be copied, because it is contantly
    // being modified. Lexical objects are not mutated, and context
    // objects are not mutated in a harmful way, so they can be shared
    // between runs of the parser.
    function copy(){
      var _context = context, _lexical = lexical, _cc = cc.concat([]), _tokenState = tokens.state;
  
      return function copyParser(input){
        context = _context;
        lexical = _lexical;
        cc = _cc.concat([]); // copies the array
        column = indented = 0;
        tokens = tokenizeJavaScript(input, _tokenState);
        return parser;
      };
    }

    // Helper function for pushing a number of actions onto the cc
    // stack in reverse order.
    function push(fs){
      for (var i = fs.length - 1; i >= 0; i--)
        cc.push(fs[i]);
    }
    // cont and pass are used by the action functions to add other
    // actions to the stack. cont will cause the current token to be
    // consumed, pass will leave it for the next action.
    function cont(){
      push(arguments);
      consume = true;
    }
    function pass(){
      push(arguments);
      consume = false;
    }
    // Used to change the style of the current token.
    function mark(style){
      marked = style;
    }

    // Push a new scope. Will automatically link the current scope.
    function pushcontext(){
      context = {prev: context, vars: {"this": true, "arguments": true}};
    }
    // Pop off the current scope.
    function popcontext(){
      context = context.prev;
    }
    // Register a variable in the current scope.
    function register(varname){
      if (context){
        mark("js-variabledef");
        context.vars[varname] = true;
      }
    }
    // Check whether a variable is defined in the current scope.
    function inScope(varname){
      var cursor = context;
      while (cursor) {
        if (cursor.vars[varname])
          return true;
        cursor = cursor.prev;
      }
      return false;
    }
  
    // Push a new lexical context of the given type.
    function pushlex(type, info) {
      var result = function(){
        lexical = new JSLexical(indented, column, type, null, lexical, info)
      };
      result.lex = true;
      return result;
    }
    // Pop off the current lexical context.
    function poplex(){
      if (lexical.type == ")")
        indented = lexical.indented;
      lexical = lexical.prev;
    }
    poplex.lex = true;
    // The 'lex' flag on these actions is used by the 'next' function
    // to know they can (and have to) be ran before moving on to the
    // next token.
  
    // Creates an action that discards tokens until it finds one of
    // the given type.
    function expect(wanted){
      return function expecting(type){
        if (type == wanted) cont();
        else if (wanted == ";") pass();
        else cont(arguments.callee);
      };
    }

    // Looks for a statement, and then calls itself.
    function statements(type){
      return pass(statement, statements);
    }
    function expressions(type){
      return pass(expression, expressions);
    }
    // Dispatches various types of statements based on the type of the
    // current token.
    function statement(type){
      if (type == "var") cont(pushlex("vardef"), vardef1, expect(";"), poplex);
      else if (type == "keyword a") cont(pushlex("form"), expression, statement, poplex);
      else if (type == "keyword b") cont(pushlex("form"), statement, poplex);
      else if (type == "{") cont(pushlex("}"), block, poplex);
      else if (type == ";") cont();
      else if (type == "function") cont(functiondef);
      else if (type == "for") cont(pushlex("form"), expect("("), pushlex(")"), forspec1, expect(")"), poplex, statement, poplex);
      else if (type == "variable") cont(pushlex("stat"), maybelabel);
      else if (type == "switch") cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"), block, poplex, poplex);
      else if (type == "case") cont(expression, expect(":"));
      else if (type == "default") cont(expect(":"));
      else if (type == "catch") cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"), statement, poplex, popcontext);
      else pass(pushlex("stat"), expression, expect(";"), poplex);
    }
    // Dispatch expression types.
    function expression(type){
      if (atomicTypes.hasOwnProperty(type)) cont(maybeoperator);
      else if (type == "function") cont(functiondef);
      else if (type == "keyword c") cont(expression);
      else if (type == "(") cont(pushlex(")"), expression, expect(")"), poplex, maybeoperator);
      else if (type == "operator") cont(expression);
      else if (type == "[") cont(pushlex("]"), commasep(expression, "]"), poplex, maybeoperator);
      else if (type == "{") cont(pushlex("}"), commasep(objprop, "}"), poplex, maybeoperator);
      else cont();
    }
    // Called for places where operators, function calls, or
    // subscripts are valid. Will skip on to the next action if none
    // is found.
    function maybeoperator(type, value){
      if (type == "operator" && /\+\+|--/.test(value)) cont(maybeoperator);
      else if (type == "operator") cont(expression);
      else if (type == ";") pass();
      else if (type == "(") cont(pushlex(")"), commasep(expression, ")"), poplex, maybeoperator);
      else if (type == ".") cont(property, maybeoperator);
      else if (type == "[") cont(pushlex("]"), expression, expect("]"), poplex, maybeoperator);
    }
    // When a statement starts with a variable name, it might be a
    // label. If no colon follows, it's a regular statement.
    function maybelabel(type){
      if (type == ":") cont(poplex, statement);
      else pass(maybeoperator, expect(";"), poplex);
    }
    // Property names need to have their style adjusted -- the
    // tokenizer thinks they are variables.
    function property(type){
      if (type == "variable") {mark("js-property"); cont();}
    }
    // This parses a property and its value in an object literal.
    function objprop(type){
      if (type == "variable") mark("js-property");
      if (atomicTypes.hasOwnProperty(type)) cont(expect(":"), expression);
    }
    // Parses a comma-separated list of the things that are recognized
    // by the 'what' argument.
    function commasep(what, end){
      function proceed(type) {
        if (type == ",") cont(what, proceed);
        else if (type == end) cont();
        else cont(expect(end));
      }
      return function commaSeparated(type) {
        if (type == end) cont();
        else pass(what, proceed);
      };
    }
    // Look for statements until a closing brace is found.
    function block(type){
      if (type == "}") cont();
      else pass(statement, block);
    }
    // Variable definitions are split into two actions -- 1 looks for
    // a name or the end of the definition, 2 looks for an '=' sign or
    // a comma.
    function vardef1(type, value){
      if (type == "variable"){register(value); cont(vardef2);}
      else cont();
    }
    function vardef2(type, value){
      if (value == "=") cont(expression, vardef2);
      else if (type == ",") cont(vardef1);
    }
    // For loops.
    function forspec1(type){
      if (type == "var") cont(vardef1, forspec2);
      else if (type == ";") pass(forspec2);
      else if (type == "variable") cont(formaybein);
      else pass(forspec2);
    }
    function formaybein(type, value){
      if (value == "in") cont(expression);
      else cont(maybeoperator, forspec2);
    }
    function forspec2(type, value){
      if (type == ";") cont(forspec3);
      else if (value == "in") cont(expression);
      else cont(expression, expect(";"), forspec3);
    }
    function forspec3(type) {
      if (type == ")") pass();
      else cont(expression);
    }
    // A function definition creates a new context, and the variables
    // in its argument list have to be added to this context.
    function functiondef(type, value){
      if (type == "variable"){register(value); cont(functiondef);}
      else if (type == "(") cont(pushlex(")"), pushcontext, commasep(funarg, ")"), poplex, statement, popcontext);
    }
    function funarg(type, value){
      if (type == "variable"){register(value); cont();}
    }
  
    return parser;
  }

  return {
    make: parseJS,
    electricChars: "{}:",
    configure: function(obj) {
      if (obj.json != null) json = obj.json;
    }
  };
})();
var HTMLMixedParser = Editor.Parser = (function() {

  // tags that trigger seperate parsers
  var triggers = {
    "script": "JSParser",
    "style":  "CSSParser"
  };

  function checkDependencies() {
    var parsers = ['XMLParser'];
    for (var p in triggers) parsers.push(triggers[p]);
    for (var i in parsers) {
      if (!window[parsers[i]]) throw new Error(parsers[i] + " parser must be loaded for HTML mixed mode to work.");
    }
    XMLParser.configure({useHTMLKludges: true});
  }

  function parseMixed(stream) {
    checkDependencies();
    var htmlParser = XMLParser.make(stream), localParser = null, inTag = false;
    var iter = {next: top, copy: copy};

    function top() {
      var token = htmlParser.next();
      if (token.content == "<")
        inTag = true;
      else if (token.style == "xml-tagname" && inTag === true)
        inTag = token.content.toLowerCase();
      else if (token.content == ">") {
        if (triggers[inTag]) {
          var parser = window[triggers[inTag]];
          iter.next = local(parser, "</" + inTag);
        }
        inTag = false;
      }
      return token;
    }
    function local(parser, tag) {
      var baseIndent = htmlParser.indentation();
      localParser = parser.make(stream, baseIndent + indentUnit);
      return function() {
        if (stream.lookAhead(tag, false, false, true)) {
          localParser = null;
          iter.next = top;
          return top();
        }

        var token = localParser.next();
        var lt = token.value.lastIndexOf("<"), sz = Math.min(token.value.length - lt, tag.length);
        if (lt != -1 && token.value.slice(lt, lt + sz).toLowerCase() == tag.slice(0, sz) &&
            stream.lookAhead(tag.slice(sz), false, false, true)) {
          stream.push(token.value.slice(lt));
          token.value = token.value.slice(0, lt);
        }

        if (token.indentation) {
          var oldIndent = token.indentation;
          token.indentation = function(chars) {
            if (chars == "</")
              return baseIndent;
            else
              return oldIndent(chars);
          };
        }

        return token;
      };
    }

    function copy() {
      var _html = htmlParser.copy(), _local = localParser && localParser.copy(),
          _next = iter.next, _inTag = inTag;
      return function(_stream) {
        stream = _stream;
        htmlParser = _html(_stream);
        localParser = _local && _local(_stream);
        iter.next = _next;
        inTag = _inTag;
        return iter;
      };
    }
    return iter;
  }

  return {
    make: parseMixed,
    electricChars: "{}/:",
    configure: function(obj) {
      if (obj.triggers) triggers = obj.triggers;
    }
  };

})();