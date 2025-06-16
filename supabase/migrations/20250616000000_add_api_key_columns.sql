
-- Add API key columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
ADD COLUMN IF NOT EXISTS pixabay_api_key TEXT,
ADD COLUMN IF NOT EXISTS huggingface_api_key TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.gemini_api_key IS 'Google Gemini API key for the user';
COMMENT ON COLUMN profiles.pixabay_api_key IS 'Pixabay API key for image search';
COMMENT ON COLUMN profiles.huggingface_api_key IS 'Hugging Face API key for AI models';
