# GoodWe Challenge - Setup Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. **Clone or download the project**
   ```bash
   cd challengegoodwe
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env file and add your Google Gemini API key
   # Get your API key from: https://makersuite.google.com/app/apikey
   ```

5. **Run the applications**
   
   **For Config Items (Port 5000):**
   ```bash
   python config_itens.py
   ```
   
   **For Consumption Monitor (Port 5001):**
   ```bash
   python consumo.py
   ```

6. **Access the application**
   - Main page: Open `pginicial.html` in your browser
   - Config Items: http://localhost:5000
   - Consumption: http://localhost:5001

## Project Structure
- `*.html` - Frontend pages
- `*.css` - Stylesheets
- `*.js` - JavaScript files
- `*.py` - Python backend services
- `imagens/` - Image assets
- `requirements.txt` - Python dependencies
- `.env` - Environment configuration (create from .env.example)

## Features
- Device configuration management
- Energy consumption monitoring
- AI-powered virtual assistant (Gemini)
- Modern responsive design
- Real-time data visualization

## API Endpoints
- `POST /api/assistente` - Virtual assistant chat
- `GET /api/dispositivos` - Get available devices
- `POST /api/simular-consumo` - Simulate energy consumption
- `GET /imagens/<filename>` - Serve images

## Troubleshooting
- Make sure all dependencies are installed: `pip list`
- Check that the Gemini API key is correctly set in `.env`
- Verify Python version: `python --version`
- Check if ports 5000 and 5001 are available