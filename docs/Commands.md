# Run in background (detached mode)
```pwsd
docker-compose up --build -d
```

# View logs
```pwsd
docker-compose logs -f backend
```

# Stop everything
```pwsd
docker-compose down
```

# Stop and wipe the database volume (fresh start)
```pwsd
docker-compose down -v
```

# Create a Django superuser
```pwsd
docker-compose exec backend python manage.py createsuperuser
```

# Run Django shell
```pwsd
docker-compose exec backend python manage.py shell
```


# In a separate terminal
```pwsd
cd d:\Close-Scale\frontend
npm install
npm run dev
```
