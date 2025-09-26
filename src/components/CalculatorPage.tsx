'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplayValue(num);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? num : displayValue + num);
    }
  };

  const handleOperatorClick = (op: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = calculate(previousValue, inputValue, operator);
      setPreviousValue(result);
      setDisplayValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(op);
  };

  const calculate = (prev: number, current: number, op: string) => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return prev / current;
      default:
        return current;
    }
  };

  const handleEqualsClick = () => {
    const inputValue = parseFloat(displayValue);
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplayValue(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(false);
    }
  };

  const handleClearClick = () => {
    setDisplayValue('0');
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  };

  const handleDecimalClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  return (
    <Card className="max-w-sm mx-auto shadow-lg">
      <CardContent className="p-4">
        <div className="bg-muted text-right p-4 rounded-lg mb-4">
          <p className="text-4xl font-mono text-foreground break-all">{displayValue}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" className="col-span-2 text-lg" onClick={handleClearClick}>C</Button>
          <Button variant="outline" className="text-lg" onClick={() => handleOperatorClick('/')}>/</Button>
          <Button variant="outline" className="text-lg" onClick={() => handleOperatorClick('*')}>*</Button>
          
          {['7', '8', '9'].map(num => (
            <Button key={num} variant="outline" className="text-lg" onClick={() => handleNumberClick(num)}>{num}</Button>
          ))}
          <Button variant="outline" className="text-lg" onClick={() => handleOperatorClick('-')}>-</Button>
          
          {['4', '5', '6'].map(num => (
            <Button key={num} variant="outline" className="text-lg" onClick={() => handleNumberClick(num)}>{num}</Button>
          ))}
          <Button variant="outline" className="text-lg" onClick={() => handleOperatorClick('+')}>+</Button>

          {['1', '2', '3'].map(num => (
            <Button key={num} variant="outline" className="text-lg" onClick={() => handleNumberClick(num)}>{num}</Button>
          ))}
          <Button variant="default" className="row-span-2 text-lg" onClick={handleEqualsClick}>=</Button>
          
          <Button variant="outline" className="col-span-2 text-lg" onClick={() => handleNumberClick('0')}>0</Button>
          <Button variant="outline" className="text-lg" onClick={handleDecimalClick}>.</Button>
        </div>
      </CardContent>
    </Card>
  );
}
