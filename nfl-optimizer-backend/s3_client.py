import boto3
import logging
# from env_keys import AWS_ACCESS_KEY, AWS_SECRET_KEY
import io
from config import Config

class S3Client:
    def __init__(self):
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=Config.get(key='AWS_ACCESS_KEY'),
            aws_secret_access_key=Config.get(key='AWS_SECRET_KEY')
        )

    def upload_file(self, season: int, week: int, filename: str) -> bool:
        try:
            self.s3_client.upload_file(
                f'data/{season}/week{week}/{filename}', 'nfl-dfs', f'{season}/week{week}/{filename}')
            return True
        except Exception as e:
            logging.error(f'Error uploading with exception {e}')
            return False
    
    def download_file(self, season: int, week: int, filename: str) -> str:
        # Create a BytesIO object (in-memory binary stream)
        binary_data_stream = io.BytesIO()
        # Download the file object into the stream
        try:
            self.s3_client.download_fileobj('nfl-dfs', f'{season}/week{week}/{filename}', binary_data_stream)
            logging.info(f"File '{season}/week{week}/{filename}' downloaded successfully into memory.")
            binary_data_stream.seek(0)  # Rewind to the beginning of the stream
            return binary_data_stream.read()
        except Exception as e:
            logging.error(f'Error downloading {filename} with exception {e}')
            return None

