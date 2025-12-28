/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow anyone to connect (for development)
  },
})
export class RideGateway {
  @WebSocketServer()
  server: Server;

  // 1. Handle "requestRide" event from Frontend
  @SubscribeMessage('requestRide')
  async handleRideRequest(
    @MessageBody() data: { riderId: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `📡 Client ${client.id} requested a ride at ${data.lat}, ${data.lng}`,
    );

    try {
      // 2. Call the Dispatch Service (HTTP)
      // Note: In Docker, we would use 'http://dispatch:3002', but for localhost use 'localhost'
      const response = await axios.post(
        'http://localhost:3002/dispatch/request-ride',
        {
          riderId: data.riderId,
          lat: data.lat,
          lng: data.lng,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const tripData = response.data;

      // 3. Notify the Rider (Success)
      this.server.to(client.id).emit('rideConfirmed', tripData);

      // 4. Notify the Driver (We need a way to target specific drivers, 
      // but for now, we'll just broadcast to everyone for the demo)
      this.server.emit('driverAlert', {
        message: 'New Ride Opportunity! 💰',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tripId: tripData.tripId,
      });

    } catch (error) {
      // Notify Rider of Failure
      this.server.to(client.id).emit('rideError', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: error.response?.data?.message || 'Something went wrong',
      });
    }
  }
}