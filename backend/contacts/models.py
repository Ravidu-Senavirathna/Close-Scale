from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    industry = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    custom_fields = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.name

class Contact(models.Model):
    first_name = models.CharField(max_length=150, db_index=True)
    last_name = models.CharField(max_length=150, db_index=True)
    email = models.EmailField(db_index=True, unique=True)
    phone = models.CharField(max_length=50, blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    
    # Freelancers are possible, so organization is nullable
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="contacts"
    )
    
    custom_fields = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
