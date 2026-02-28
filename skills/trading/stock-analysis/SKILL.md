---
name: stock-analysis
description: Analyzes stock market data, calculates technical indicators (SMA, EMA, RSI, MACD), and generates trading signals. Use when a user wants to analyze stocks, evaluate market trends, calculate moving averages, identify support/resistance levels, or build trading strategies.
license: MIT
metadata:
  author: Bob Smith
  difficulty: advanced
  rating: "4.6"
  domain: trading
  use-cases: "stock-market-analysis, technical-indicator-calculation, trading-signal-generation, portfolio-analysis"
  featured: "true"
  tags: "stocks, trading, finance, technical-analysis"
---

# Stock Analysis Skill

Advanced stock market analysis and technical indicator calculations for traders.

## Features

- Real-time price data handling
- Technical indicator calculations (SMA, EMA, RSI, MACD)
- Trend identification
- Support/resistance level detection
- Trading signal generation

## Quick Start

```python
import pandas as pd
import numpy as np

class StockAnalyzer:
    def __init__(self, data):
        self.data = data

    def calculate_sma(self, period=20):
        """Calculate Simple Moving Average"""
        return self.data['close'].rolling(window=period).mean()

    def calculate_ema(self, period=20):
        """Calculate Exponential Moving Average"""
        return self.data['close'].ewm(span=period).mean()

    def calculate_rsi(self, period=14):
        """Calculate Relative Strength Index"""
        delta = self.data['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
```

## Technical Indicators

### Simple Moving Average (SMA)
Calculates the average price over a specified period.

```python
sma_20 = analyzer.calculate_sma(20)
```

### Exponential Moving Average (EMA)
Gives more weight to recent prices.

```python
ema_20 = analyzer.calculate_ema(20)
```

### Relative Strength Index (RSI)
Measures momentum (0-100 scale, overbought/oversold at 70/30).

```python
rsi = analyzer.calculate_rsi(14)
```

## Trading Signals

```python
def generate_signals(analyzer):
    sma_20 = analyzer.calculate_sma(20)
    sma_50 = analyzer.calculate_sma(50)

    # Golden Cross: SMA20 crosses above SMA50 (bullish)
    # Death Cross: SMA20 crosses below SMA50 (bearish)

    return {
        'golden_cross': sma_20 > sma_50,
        'death_cross': sma_20 < sma_50,
    }
```

## Best Practices

1. Always use multiple indicators (don't rely on a single indicator)
2. Consider market conditions (trend, volatility, support/resistance)
3. Manage risk with proper stop-loss orders
4. Backtest strategies before live trading
5. Keep emotions out of trading decisions

## Disclaimer

This skill is for educational purposes. Past performance does not guarantee future results. Always conduct your own research and consult with a financial advisor before making trading decisions.
