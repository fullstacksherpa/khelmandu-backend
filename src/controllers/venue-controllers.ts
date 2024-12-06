import Game from "@src/models/game.model";
import Venue, { IVenue } from "@src/models/venue.model.js";
import { Request, Response } from "express";

export const newVenues = [
  {
    name: "Dhanyentari Futsal",
    lat: 27.7206791830945,
    lng: 85.34101033438,
    phone: 97714009635,
    defaultSchedule: { openingTime: "09:00", closingTime: "18:00" },
    customSchedule: new Map([
      ["Monday", { openingTime: "09:00", closingTime: "18:00" }],
      ["Tuesday", { openingTime: "10:00", closingTime: "20:00" }],
    ]),
    sportsAvailable: [
      {
        id: "1",
        name: "Futsal",
        defaultPrice: 1800,
        courts: [
          {
            name: "Futsal ground",
            number: 1,
            timeSlots: [
              { day: "monday", from: "09:00", to: "17:00", customPrice: 1000 },
              { day: "monday", from: "17:00", to: "21:00", customPrice: 1500 },
            ],
          },
        ],
      },
    ],
    images: [
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732252756/venue/wbrkwckcpoz86yy0yx08.jpg",
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732252917/venue/uuad2fxghod95hvoxz1u.jpg",
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732252965/venue/xoxbgrgd6jcdgtl8z8a0.jpg",
    ],
    address: "Dhanawantari Marg",
    iframeLink:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14127.650552588697!2d85.3405236!3d27.719983499999998!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb196e42c2727b%3A0xd4f58abde7a271c2!2sDhanyentari%20Futsal!5e0!3m2!1sen!2sca!4v1732253115441!5m2!1sen!2sca",
    bookings: [],
    amenity: [
      "6742909a5f62b1291daf9caf",
      "6742909a5f62b1291daf9cb0",
      "6742909a5f62b1291daf9cb1",
      "6742909a5f62b1291daf9cb2",
      "6742909a5f62b1291daf9cb3",
    ],
    lastUpdatedAt: "2024-11-21T10:30:00.000Z",

    subscription: {
      isSubscribed: false,
      isPremium: false,
    },
  },
  {
    name: "Futsal Arena Boudha",
    lat: 27.7162254411208,
    lng: 85.3620239236886,
    phone: 9779801070700,
    defaultSchedule: { openingTime: "09:00", closingTime: "18:00" },
    customSchedule: new Map([
      ["Monday", { openingTime: "09:00", closingTime: "18:00" }],
      ["Tuesday", { openingTime: "10:00", closingTime: "20:00" }],
    ]),
    sportsAvailable: [
      {
        id: "1",
        name: "Futsal",
        price: 1800,
        courts: [
          {
            name: "Futsal ground",
            number: 1,
            timeSlots: [
              { day: "monday", from: "09:00", to: "17:00", customPrice: 1000 },
              { day: "monday", from: "17:00", to: "21:00", customPrice: 1500 },
            ],
          },
        ],
      },
    ],
    images: [
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732255811/venue/hjhp76d25ekiihyb4nil.jpg",
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732255844/venue/vbysxyt3dmd0tbbwz0sj.jpg",
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732255870/venue/yptdmdobyga1u29zhmtd.jpg",
    ],
    address: "Boudha (Near Samatha School)",
    iframeLink:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14128.186029661867!2d85.3620883!3d27.7158503!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1bd0e441b9d1%3A0x81962eaa6a191e35!2sFutsal%20Arena%20Boudha!5e0!3m2!1sen!2sca!4v1732255973433!5m2!1sen!2sca",
    bookings: [],
    amenity: [
      "6742909a5f62b1291daf9caf",
      "6742909a5f62b1291daf9cb0",
      "6742909a5f62b1291daf9cb1",
      "6742909a5f62b1291daf9cb2",
      "6742909a5f62b1291daf9cb3",
    ],
    lastUpdatedAt: "2024-11-21T10:30:00.000Z",

    subscription: {
      isSubscribed: false,
      isPremium: false,
    },
  },
];

export async function getVenues(req: Request, res: Response): Promise<void> {
  try {
    // Fetch venues with populated fields for bookings
    const venues = await Venue.find({})
      .populate("bookings.user", "username email") // Populate user with specific fields
      .populate("bookings.game", "date time"); // Populate game with specific fields

    // Format the venues
    const formattedVenues = venues.map((venue) => {
      const venueObject = venue.toObject() as Omit<IVenue, "_id"> & {
        _id: string;
      };

      // Safeguard for bookings being undefined or null
      const formattedBookings = (venueObject.bookings ?? []).map(
        (booking: any) => ({
          ...booking,
          user:
            booking.user && typeof booking.user === "object"
              ? {
                  _id: booking.user._id.toString(),
                  username: booking.user.username,
                  email: booking.user.email,
                }
              : null,
          game:
            booking.game && typeof booking.game === "object"
              ? {
                  _id: booking.game._id.toString(),
                  date: booking.game.date,
                  time: booking.game.time,
                }
              : null,
        })
      );

      return {
        ...venueObject,
        _id: venueObject._id.toString(), // Ensure _id is string
        bookings: formattedBookings, // Include formatted bookings
      };
    });

    res.status(200).json(formattedVenues);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Failed to fetch venues" });
  }
}

export async function bookVenue(req: Request, res: Response): Promise<void> {
  const { courtNumber, date, time, userId, name, game } = req.body;

  try {
    // Find the venue by name
    const venue = await Venue.findOne({ name });
    if (!venue) {
      res.status(404).json({ message: "Venue not found" });
      return;
    }

    // Check for booking conflicts
    const bookingConflict = venue.bookings.some(
      (booking) =>
        booking.courtNumber === courtNumber &&
        booking.date === date &&
        booking.time === time
    );
    if (bookingConflict) {
      res.status(400).json({ message: "Slot already booked" });
      return;
    }

    // Validate game (optional: only if game is provided)
    if (game) {
      const gameExists = await Game.findById(game);
      if (!gameExists) {
        res.status(404).json({ message: "Game not found" });
        return;
      }
    }

    // Add new booking
    venue.bookings.push({
      courtNumber,
      date,
      time,
      user: userId, // Ensure user ID is ObjectId
      game: game || undefined,
    });

    // Save the updated venue
    await venue.save();

    // Update game booking status if provided
    if (game) {
      await Game.findByIdAndUpdate(game, {
        isBooked: true,
        courtNumber,
      });
    }

    res.status(200).json({
      message: "Booking successful",
      venue,
    });
  } catch (error) {
    console.error("Error in booking venue:", error);
    res.status(500).json({ message: "Server error" });
  }
}
