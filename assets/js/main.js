"use strict";

/* jshint esversion: 6 */
/* jshint strict: true */

var textarea = document.getElementById("textarea");
textarea.innerHTML = "int main(int argc, char *argv[]) {\n    printf(\"Hello, World!\");\n    return 0;\n}";

var func = function func() {
    var code = document.getElementById("textarea").value,
        lexer = new Lexer(),
        tokens = lexer.lex(code);

    tokens = tokens.replace(/\u0000/g, "<span class=\"KEYWORDS\">");
    tokens = tokens.replace(/\u0001/g, "<span class=\"IDENTIFIERS\">");
    tokens = tokens.replace(/\u0002/g, "<span class=\"CONSTANTS_INTEGER\">");
    tokens = tokens.replace(/\u0003/g, "<span class=\"CONSTANTS_FLOAT\">");
    tokens = tokens.replace(/\u0004/g, "<span class=\"CONSTANTS_ENUM\">");
    tokens = tokens.replace(/\u0005/g, "<span class=\"CONSTANTS_CHARACTER\">");
    tokens = tokens.replace(/\u0006/g, "<span class=\"STRING_LITERALS\">");
    tokens = tokens.replace(/\u0007/g, "<span class=\"PUNCTUATORS\">");
    tokens = tokens.replace(/\u0080|\u0081|\u0082|\u0083|\u0084|\u0085|\u0086|\u0087/g, "</span>");

    document.getElementById("tokens").innerHTML = tokens;
};

func();
textarea.oninput = func;