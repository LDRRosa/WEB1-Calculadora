// Seleciona o visor e todos os botões
const display = document.getElementById('display');
const buttons = document.querySelectorAll('#buttons .button');

// Função para atualizar o visor
function updateDisplay(value) {
    let temp = display.value + value;
    display.value = temp.replace(/\s+/g, '');
}

// Função para realizar o cálculo de uma expressão
function calculate() {
    try {
        const expression = display.value
            .replace(/,/g, '.')  // Substitui vírgula por ponto decimal
            .replace(/×/g, '*')  // Substitui símbolo de multiplicação por *
            .replace(/÷/g, '/'); // Substitui símbolo de divisão por /

        // Avalia a expressão de forma segura
        let result = evaluateExpression(expression);

        // Converte o ponto decimal do resultado para vírgula
        display.value = result.toString().replace('.', ',');
    } catch (error) {
        display.value = 'Erro';
    }
}

// Função para limpar o visor
function clearDisplay() {
    display.value = '';
}

// Função para avaliar expressões matemáticas de forma segura
function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const processedTokens = resolvePercentage(tokens);
    const postfix = infixToPostfix(processedTokens);
    return evaluatePostfix(postfix);
}

// Função para dividir a expressão em tokens
function tokenize(expr) {
    const regex = /(\d+\.?\d*|\+|\-|\*|\/|\(|\)|%)/g;
    return expr.match(regex);
}


// Função para resolver porcentagens na expressão
function resolvePercentage(tokens) {
    const resolvedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '%') {
            const prev = resolvedTokens.pop(); // Obtém o número anterior
            let next = tokens[i + 1]; // Obtém o número seguinte (se houver)

            if (next && !isNaN(next)) {
                // Caso 20%1000: "X% de Y" se transforma em "(X / 100) * Y"
                const result = (parseFloat(prev) / 100) * parseFloat(next);
                resolvedTokens.push(result);  // Resultado da porcentagem
                i++; // Avança para o próximo token porque já foi processado
            }
            // Caso x-20%: "X - (X * Y%)" - Calcular a porcentagem de X
            if (prev !== undefined && !isNaN(prev)) {
                // Verifica se há um operador antes para aplicar corretamente
                const lastOperator = resolvedTokens[resolvedTokens.length - 1];
                if (lastOperator === '+' || lastOperator === '-' || lastOperator === '*' || lastOperator === '/') {
                    const base = resolvedTokens.length > 1 ? resolvedTokens[resolvedTokens.length - 2] : prev;
                    const result = (parseFloat(base) * parseFloat(prev)) / 100;
                    if (lastOperator === '-') {
                        resolvedTokens.pop(); // Remove o operador '-'
                        resolvedTokens.pop(); // Remove o número base
                        resolvedTokens.push((parseFloat(base) - result).toString());
                    } else if (lastOperator === '+') {
                        resolvedTokens.pop(); // Remove o operador '+'
                        resolvedTokens.pop(); // Remove o número base
                        resolvedTokens.push((parseFloat(base) + result).toString());
                    } else if (lastOperator === '*') {
                        resolvedTokens.push(result.toString());
                    } else if (lastOperator === '/') {
                        resolvedTokens.push((parseFloat(base) / result).toString());
                    }
                }
            }
        } else {
            resolvedTokens.push(tokens[i]);  // Adiciona os tokens que não são porcentagens
        }
    }
    return resolvedTokens;
}




// Converte de notação infixa para pós-fixa (RPN - Reverse Polish Notation)
function infixToPostfix(tokens) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const stack = [];
    const output = [];

    tokens.forEach(token => {
        if (!isNaN(token)) {
            output.push(token); // Números vão diretamente para a saída
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop(); // Remove o '('
        } else {
            while (stack.length > 0 && precedence[token] <= precedence[stack[stack.length - 1]]) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });

    // Esvaziar a pilha restante
    while (stack.length > 0) {
        output.push(stack.pop());
    }

    return output;
}

// Avalia uma expressão em notação pós-fixa
function evaluatePostfix(postfix) {
    const stack = [];

    postfix.forEach(token => {
        if (!isNaN(token)) {
            stack.push(parseFloat(token)); // Adiciona números à pilha
        } else {
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    stack.push(a / b);
                    break;
            }
        }
    });

    return stack[0]; // O resultado final está no topo da pilha
}

// Adiciona o evento de clique a cada botão
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonValue = button.textContent;

        if (button.dataset.number) {
            console.log("Você apertou: " + button.dataset.number);
            updateDisplay(buttonValue);
        } else if (button.dataset.operation) {
            console.log("Você apertou: " + buttonValue);
            updateDisplay(buttonValue);
        } else if (button.dataset.clear) {
            console.log("Você apertou: " + button.dataset.clear);
            clearDisplay();
        } else if (button.dataset.equal) {
            console.log("Você apertou: " + button.dataset.equal);
            calculate();
        } else if (button.dataset.decimal) {
            updateDisplay(',');
        } else if (button.dataset.parenthesis) {
            console.log("Você apertou: " + button.dataset.parenthesis);
            updateDisplay(button.dataset.parenthesis);
        }
    });
});


// Adiciona suporte ao teclado para o Enter
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previne o comportamento padrão do botão
        calculate();
    }
});