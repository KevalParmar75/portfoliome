# gunicorn.conf.py
workers = 1
threads = 2
worker_class = "sync"
timeout = 120
max_requests = 100
max_requests_jitter = 10
```

Then update your Render **Start Command** to:
```
gunicorn core.wsgi:application --config gunicorn.conf.py