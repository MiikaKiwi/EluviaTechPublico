from django.db import models

# Create your models here.

# models.py
from django.db import models


class Tickets(models.Model):
    categoria = models.CharField(max_length=50)
    severidad = models.CharField(max_length=20)
    asunto = models.CharField(max_length=150)
    descripcion = models.TextField()
    estado = models.CharField(max_length=40)
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True)

    def __str__(self):
        return self.asunto


class Usuarios(models.Model):
    usuario = models.CharField(max_length=120)
    password = models.CharField(max_length=25)

    def __str__(self):
        return self.usuario