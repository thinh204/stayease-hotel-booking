import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";

const sqlite = new DatabaseSync(fileURLToPath(new URL("./dev.db", import.meta.url)));
const postgres = new PrismaClient();

const rows = (table) => sqlite.prepare(`SELECT * FROM ${table}`).all();
const date = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = typeof value === "bigint" ? Number(value) : value;
  return new Date(normalized);
};
const bool = (value) => Boolean(value);

const users = rows("users").map((r) => ({
  id: r.id, email: r.email, password: r.password, fullName: r.fullName,
  phone: r.phone, avatar: r.avatar, bio: r.bio, role: r.role,
  isActive: bool(r.isActive), lastLogin: date(r.lastLogin),
  loginAttempts: Number(r.loginAttempts), isLocked: bool(r.isLocked),
  lockedUntil: date(r.lockedUntil), createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const hotels = rows("hotels").map((r) => ({
  id: r.id, name: r.name, description: r.description, city: r.city,
  country: r.country, address: r.address, pricePerNight: Number(r.pricePerNight),
  rating: Number(r.rating), images: r.images, amenities: r.amenities,
  isActive: bool(r.isActive), managerId: r.managerId, createdBy: r.createdBy,
  createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const rooms = rows("rooms").map((r) => ({
  id: r.id, hotelId: r.hotelId, type: r.type, price: Number(r.price),
  capacity: Number(r.capacity), totalRooms: Number(r.totalRooms),
  availableRooms: Number(r.availableRooms), amenities: r.amenities, images: r.images,
  createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const bookings = rows("bookings").map((r) => ({
  id: r.id, reference: r.reference, userId: r.userId, hotelId: r.hotelId,
  roomId: r.roomId, checkIn: date(r.checkIn), checkOut: date(r.checkOut),
  nights: Number(r.nights), guests: Number(r.guests), totalPrice: Number(r.totalPrice),
  status: r.status, paymentStatus: r.paymentStatus, specialRequests: r.specialRequests,
  refundAmount: r.refundAmount === null ? null : Number(r.refundAmount),
  refundReason: r.refundReason, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const reviews = rows("reviews").map((r) => ({
  id: r.id, userId: r.userId, hotelId: r.hotelId, rating: Number(r.rating),
  comment: r.comment, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const auditLogs = rows("audit_logs").map((r) => ({
  id: r.id, userId: r.userId, action: r.action, entity: r.entity,
  entityId: r.entityId, description: r.description, oldValues: r.oldValues,
  newValues: r.newValues, ipAddress: r.ipAddress, userAgent: r.userAgent,
  status: r.status, errorMessage: r.errorMessage, createdAt: date(r.createdAt),
}));

const adminSettings = rows("admin_settings").map((r) => ({
  id: r.id, platformName: r.platformName, platformDescription: r.platformDescription,
  logo: r.logo, favicon: r.favicon, primaryColor: r.primaryColor,
  secondaryColor: r.secondaryColor, maintenanceMode: bool(r.maintenanceMode),
  maintenanceMessage: r.maintenanceMessage, contactEmail: r.contactEmail,
  supportPhone: r.supportPhone, timezone: r.timezone, currency: r.currency,
  maxLoginAttempts: Number(r.maxLoginAttempts), lockoutDuration: Number(r.lockoutDuration),
  sessionTimeout: Number(r.sessionTimeout),
  enableEmailVerification: bool(r.enableEmailVerification),
  enableTwoFactor: bool(r.enableTwoFactor), emailProvider: r.emailProvider,
  smtpHost: r.smtpHost, smtpPort: r.smtpPort === null ? null : Number(r.smtpPort),
  smtpUser: r.smtpUser, smtpPassword: r.smtpPassword,
  createdAt: date(r.createdAt), updatedAt: date(r.updatedAt),
}));

const userStatistics = rows("user_statistics").map((r) => ({
  id: r.id, date: date(r.date), totalUsers: Number(r.totalUsers),
  newUsersToday: Number(r.newUsersToday), activeUsersToday: Number(r.activeUsersToday),
  totalBookingsToday: Number(r.totalBookingsToday), totalRevenueToday: Number(r.totalRevenueToday),
  averageBookingValue: Number(r.averageBookingValue), cancellationRate: Number(r.cancellationRate),
  createdAt: date(r.createdAt),
}));

const batches = [
  ["users", postgres.user, users],
  ["admin_settings", postgres.adminSettings, adminSettings],
  ["hotels", postgres.hotel, hotels],
  ["rooms", postgres.room, rooms],
  ["bookings", postgres.booking, bookings],
  ["reviews", postgres.review, reviews],
  ["audit_logs", postgres.auditLog, auditLogs],
  ["user_statistics", postgres.userStatistics, userStatistics],
];

try {
  const migrated = {};
  for (const [name, model, data] of batches) {
    const result = data.length ? await model.createMany({ data, skipDuplicates: true }) : { count: 0 };
    migrated[name] = { source: data.length, inserted: result.count, destination: await model.count() };
  }
  console.log(JSON.stringify(migrated, null, 2));
} finally {
  sqlite.close();
  await postgres.$disconnect();
}
