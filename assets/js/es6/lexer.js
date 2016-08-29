/**
 * Class Lexer
 * C language lexical analyzer
 * C11 (C standard revision)
 * ISO/IEC 9899:2011
 */

/* jshint esversion: 6 */
/* jshint strict: true */

class Lexer {
    constructor() {
        //================> Keywords
        this.keywords =
            `\\b(auto|if|break|inline|case|int|char|long|const|register|continue|restrict|default|return|do|short |double|signed|else|sizeof|enum|static|extern|struct|float|switch|for|typedef|goto|union|unsigned|void|volatile |while|_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local)\\b`;


        this.REGEXP_KEYWORDS = new RegExp(
            `${this.keywords}`,
            "g"
        );


        //================> Identifiers
        this.hex_quad = `[0-9a-fA-F]{4}`;
        this.universal_character_name =
            `((\\\\u${this.hex_quad})|(\\\\U${this.hex_quad}${this.hex_quad}))`;
        this.digit = `[0-9]`;
        this.nondigit = `[_a-zA-Z]`;
        this.identifier_nondigit =
            `((${this.nondigit}+)|${this.universal_character_name})`;
        this._regexpIdentifiers =
            `((${this.identifier_nondigit}+)${this.digit}*)`;


        this.REGEXP_IDENTIFIERS = new RegExp(
            `((${this.identifier_nondigit}+)${this.digit}*)+`,
            "g"
        );


        //================> Constants(Integer)
        this.long_long_suffix = `(ll|LL)`;
        this.long_suffix = `(l|L)`;
        this.unsigned_suffix = `(u|U)`;
        this.integer_suffix =
            `((${this.unsigned_suffix}${this.long_suffix}?)|(${this.unsigned_suffix}${this.long_long_suffix})|(${this.long_suffix}${this.unsigned_suffix}?)|(${this.long_long_suffix}${this.unsigned_suffix}?))`;
        this.hexadecimal_digit = `[0-9a-fA-F]`;
        this.octal_digit = `[0-7]`;
        this.nonzero_digit = `[1-9]`;
        this.hexadecimal_prefix = `((0x)|(0X))`;
        this.hexadecimal_constant =
            `(${this.hexadecimal_prefix}${this.hexadecimal_digit}+)`;
        this.octal_constant = `(0[0-7]*)`;
        this.decimal_constant = `(${this.nonzero_digit}${this.digit}*)`;
        this._regexpConstantsInteger =
            `((${this.decimal_constant}${this.integer_suffix}?)|(${this.octal_constant}${this.integer_suffix}?)|(${this.hexadecimal_constant}${this.integer_suffix}?))`;


        this.REGEXP_CONSTANTS_INTEGER = new RegExp(
            `(${this.decimal_constant}${this.integer_suffix}?)|(${this.octal_constant}${this.integer_suffix}?)|(${this.hexadecimal_constant}${this.integer_suffix}?)`,
            "g"
        );


        //================> Constants(Float)
        this.floating_suffix = `[flFL]`;
        this.hexadecimal_digit_sequence = `${this.hexadecimal_digit}+`;
        this.digit_sequence = `${this.digit}+`;
        this.sign = `[+-]`;
        this.binary_exponent_part =
            `([pP]${this.sign}?${this.digit_sequence})`;
        this.hexadecimal_fractional_constant =
            `((${this.hexadecimal_digit_sequence}?\\.${this.hexadecimal_digit_sequence})|(${this.hexadecimal_digit_sequence}\\.))`;
        this.exponent_part = `([eE]${this.sign}?${this.digit_sequence})`;
        this.fractional_constant =
            `((${this.digit_sequence}?\\.${this.digit_sequence})|(${this.digit_sequence}\\.))`;
        this.hexadecimal_floating_constant =
            `((${this.hexadecimal_prefix}${this.hexadecimal_fractional_constant}${this.binary_exponent_part}${this.floating_suffix}?)|(${this.hexadecimal_prefix}${this.hexadecimal_digit_sequence}${this.binary_exponent_part}${this.floating_suffix}?))`;
        this.decimal_floating_constant =
            `((${this.fractional_constant}${this.exponent_part}?${this.floating_suffix}?)|(${this.digit_sequence}${this.exponent_part}${this.floating_suffix}?))`;


        this.REGEXP_CONSTANTS_FLOAT = new RegExp(
            `${this.decimal_floating_constant}|${this.hexadecimal_floating_constant}`,
            "g"
        );



        //================> Constants(Enumeration)
        this.enumerator =
            `(${this._regexpIdentifiers}|(${this._regexpIdentifiers}\\s*=\\s*${this._regexpConstantsInteger}))`;
        this.enumerator_list =
            `(${this.enumerator}|(${this.enumerator}(\\s*,\\s*${this.enumerator})+))`;


        this.REGEXP_CONSTANTS_ENUM = new RegExp(
            `(enum\\s+${this._regexpIdentifiers}?\\s*\\{\\s*${this.enumerator_list}\\s*\\})|(enum\\s+${this._regexpIdentifiers}?\\s*\\{\\s*${this.enumerator_list}(\\s*,\\s*${this.enumerator_list})+)|(enum\\s+${this._regexpIdentifiers})`,
            "g"
        );



        //================> Constants(Character)
        this.hexadecimal_escape_sequence =
            `(\\\\x${this.hexadecimal_digit}+)`;
        this.octal_escape_sequence = `(\\\\${this.octal_digit}{1,3})`;
        this.simple_escape_sequence =
            `(\\\\'|\\\\"|\\\\\\?|\\\\\\\\\|\\\\a|\\\\b|\\\\f|\\\\n|\\\\r|\\\\t|\\\\v)`;
        this.escape_sequence =
            `(${this.simple_escape_sequence}|${this.octal_escape_sequence}|${this.hexadecimal_escape_sequence}|${this.universal_character_name})`;
        this.c_char = `([^'\\\\\\n]|${this.escape_sequence})`;
        this.c_char_sequence = `(${this.c_char}+)`;


        this.REGEXP_CONSTANTS_CHARACTER = new RegExp(
            `[LuU]?'${this.c_char_sequence}'`,
            "g"
        );


        //================> String literals
        this.s_char = `([^"\\\\\\n]|${this.escape_sequence})`;
        this.s_char_sequence = `(${this.s_char}+)`;
        this.encoding_prefix = `((u8)|u|U|L)`;


        this.REGEXP_STRING_LITERALS = new RegExp(
            `${this.encoding_prefix}?"${this.s_char_sequence}?"`,
            "g"
        );


        //================> Punctuators
        this.REGEXP_PUNCTUATORS = new RegExp(
            `\\[|\\]|\\(|\\)|\\{|\\}|\\.|(->)|(\\+\\+)|(--)|&|\\*|\\+|-|~|!|\/|%|(<<)|(>>)|<|>|(<=)|(>=)|(==)|(!=)|\\^|\\||(&&)|(\\|\\|)|\\?|:|;|(\\.\\.\\.)|=|(\\*=)|(\\/=)|(%=)|(\\+=)|(-=)|(<<=)|(>>=)|(&=)|(\\^=)|(\\|=)|,|#|##|(<:)|(:>)|(<%)|(%>)|(%:)|(%:%:)`,
            "g"
        );
    }

    lex(code) {
        code = code.replace(/\\n/g, "\\\\n"); // TODO
        code = code.replace(this.REGEXP_CONSTANTS_ENUM, "\u0004$&\u0084");
        code = code.replace(this.REGEXP_KEYWORDS, "\u0000$&\u0080");
        code = code.replace(this.REGEXP_IDENTIFIERS, "\u0001$&\u0081");
        code = code.replace(this.REGEXP_CONSTANTS_FLOAT, "\u0003$&\u0083");
        code = code.replace(this.REGEXP_CONSTANTS_INTEGER, "\u0002$&\u0082");
        code = code.replace(this.REGEXP_CONSTANTS_CHARACTER, "\u0005$&\u0085");
        code = code.replace(this.REGEXP_STRING_LITERALS, "\u0006$&\u0086");
        code = code.replace(this.REGEXP_PUNCTUATORS, "\u0007$&\u0087");


        let beginFlag = false,
            endFlag = false,
            symbBeginFlag = false,
            symbEndFlag = false,
            charIndex = new Array(2);

        // delete IDENTIFIERS in KEYWORDS
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0000")
                beginFlag = true;

            if (code[i] === "\u0001" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0081" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
            }


            if (code[i] === "\u0080" && symbEndFlag === true) {
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
                i -= 2;
            }

            if (code[i] === "\u0081") // 81
                beginFlag = false;
        }

        // delete IDENTIFIERS in STRING_LITERALS
        charIndex = new Array(2);
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0006")
                beginFlag = true;

            if (code[i] === "\u0001" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0081" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
            }

            if (code[i] === "\u0086" && symbEndFlag === true) {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0086")
                beginFlag = false;

        }

        // delete CONSTANTS_INTEGER in IDENTIFIERS 
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0001")
                beginFlag = true;

            if (code[i] === "\u0002" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0082" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
                symbBeginFlag = symbEndFlag = false;
            }

            if (code[i] === "\u0081") {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0081")
                beginFlag = false;

        }

        // delete CONSTANTS_INTEGER in CONSTANTS_FLOAT
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0003")
                beginFlag = true;

            if (code[i] === "\u0002" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0082" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
            }

            if (code[i] === "\u0083" && symbEndFlag === true) {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0083")
                beginFlag = false;

        }

        // delete KEYWORDS in STRING_LITERALS
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0006")
                beginFlag = true;

            if (code[i] === "\u0000" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0080" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
            }

            if (code[i] === "\u0086" && symbEndFlag === true) {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0086")
                beginFlag = false;

        }

        // delete PUNCTUATORS in STRING_LITERALS && CONSTANTS_CHARACTER && CONSTANTS_FLOAT
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0006")
                beginFlag = true;

            if (code[i] === "\u0007" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0087" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
            }

            if ((code[i] === "\u0086") && symbEndFlag === true) {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0086")
                beginFlag = false;

        }

        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0005" || code[i] === "\u0003")
                beginFlag = true;

            if (code[i] === "\u0007" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if (code[i] === "\u0087" && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
            }

            if ((code[i] === "\u0085" || code[i] === "\u0083") && symbEndFlag === true) {
                endFlag = beginFlag = symbBeginFlag = symbEndFlag = false;
                charIndex[0] = charIndex[1] = 0;
            }

            if (code[i] === "\u0085" || code[i] === "\u0083" || code[i] === "\u00d3")
                beginFlag = false;

        }

        // delete CONSTANTS_INTEGER  in STRING_LITERALS && CONSTANTS_CHARACTER
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0006" || code[i] === "\u0005")
                beginFlag = true;

            if (code[i] === "\u0002" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if ((code[i] === "\u0082") && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
                symbBeginFlag = symbEndFlag = false;
            }

            if (code[i] === "\u0086" || code[i] === "\u0085")
                beginFlag = endFlag = false;
        }

        // delete CONSTANTS_FLOAT in STRING_LITERALS
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0006")
                beginFlag = true;

            if (code[i] === "\u0003" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if ((code[i] === "\u0083") && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
                symbBeginFlag = symbEndFlag = false;
            }

            if (code[i] === "\u0086")
                beginFlag = endFlag = false;
        }

        // delete IDENTIFIERS  in CONSTANTS_CHARACTER
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0005")
                beginFlag = true;

            if (code[i] === "\u0001" && beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if ((code[i] === "\u0081") && symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
                symbBeginFlag = symbEndFlag = false;
            }

            if (code[i] === "\u0085")
                beginFlag = endFlag = false;
        }

        // delete All in CONSTANTS_ENUM
        for (let i = 0; i < code.length; ++i) {
            if (code[i] === "\u0004")
                beginFlag = true;

            if ((code[i] === "\u0000" || code[i] === "\u0001" || code[i] === "\u0002" || code[i] === "\u0007") &&
                beginFlag === true) {
                symbBeginFlag = true;
                charIndex[0] = i;
            }

            if ((code[i] === "\u0080" || code[i] === "\u0081" || code[i] === "\u0082" || code[i] === "\u0087") &&
                symbBeginFlag === true) {
                symbEndFlag = true;
                charIndex[1] = i;
                code = code.substring(0, charIndex[0]) + code.substring(charIndex[0] + 1, code.length);
                code = code.substring(0, charIndex[1] - 1) + code.substring(charIndex[1], code.length);
                i -= 2;
                symbBeginFlag = symbEndFlag = false;
            }

            if (code[i] === "\u0084")
                beginFlag = endFlag = false;
        }

        return code;
    }
}
