from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Tickets
from .serializers import SerializerTickets

@api_view(['GET'])
def prueba_api(request):
    ticket = Tickets.objects.all()
    serializado = SerializerTickets(ticket, many=True)

    return Response(serializado.data)