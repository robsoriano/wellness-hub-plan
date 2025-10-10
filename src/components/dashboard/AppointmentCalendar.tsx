import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string;
  patient_id: string;
  nutritionist_id: string;
};

type AppointmentCalendarProps = {
  userRole: "nutritionist" | "patient";
  userId: string;
};

const AppointmentCalendar = ({ userRole, userId }: AppointmentCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "09:00",
    duration_minutes: 60,
    notes: "",
  });

  useEffect(() => {
    fetchAppointments();
    if (userRole === "nutritionist") {
      fetchPatients();
    }
  }, [userId, userRole]);

  const fetchAppointments = async () => {
    const query = supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (userRole === "nutritionist") {
      query.eq("nutritionist_id", userId);
    } else {
      query.eq("patient_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments(data || []);
    }
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, patient_id")
      .eq("nutritionist_id", userId);

    if (error) {
      console.error("Error fetching patients:", error);
    } else {
      const patientProfiles = await Promise.all(
        (data || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", p.patient_id)
            .single();
          return { ...p, name: profile?.full_name || "Unknown" };
        })
      );
      setPatients(patientProfiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const appointmentData = {
      ...formData,
      nutritionist_id: userRole === "nutritionist" ? user.id : "",
      patient_id: userRole === "patient" ? user.id : formData.patient_id,
    };

    const { error } = await supabase.from("appointments").insert(appointmentData);

    if (error) {
      toast.error("Failed to create appointment");
      console.error(error);
    } else {
      toast.success("Appointment created successfully");
      setOpen(false);
      fetchAppointments();
      
      // Create notification for the other party
      const recipientId = userRole === "nutritionist" ? formData.patient_id : appointmentData.nutritionist_id;
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "appointment",
        title: "New Appointment",
        message: `Appointment scheduled for ${format(new Date(formData.appointment_date), "PPP")} at ${formData.appointment_time}`,
      });
    }
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === new Date().toISOString().split("T")[0]
  );

  const selectedDateAppointments = date
    ? appointments.filter(
        (apt) => apt.appointment_date === format(date, "yyyy-MM-dd")
      )
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Appointment Calendar
            </CardTitle>
            {userRole === "nutritionist" && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Book Appointment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select
                        value={formData.patient_id}
                        onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.patient_id} value={patient.patient_id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.appointment_time}
                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Schedule</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{apt.appointment_time}</p>
                      <p className="text-sm text-muted-foreground">{apt.duration_minutes} minutes</p>
                      {apt.notes && <p className="text-sm mt-1">{apt.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {date && selectedDateAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Appointments for {format(date, "MMM d")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDateAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{apt.appointment_time}</p>
                      <p className="text-sm text-muted-foreground">{apt.duration_minutes} minutes</p>
                      {apt.notes && <p className="text-sm mt-1">{apt.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentCalendar;