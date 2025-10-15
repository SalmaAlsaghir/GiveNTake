import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, MapPin, Search, Handshake, ShieldCheck } from "lucide-react";

const transactionSteps = [
  {
    icon: MessageSquare,
    title: "1. Contact the Seller",
    description: "Use the seller's email or phone number listed on the item page to get in touch. Discuss the item and arrange a time and place to meet.",
  },
  {
    icon: MapPin,
    title: "2. Meet in a Safe Place",
    description: "Always choose a well-lit, public location for your meeting. University campuses, busy coffee shops, or shopping malls are great options for a safe exchange.",
  },
  {
    icon: Search,
    title: "3. Inspect the Item",
    description: "Before you pay, carefully check the item to make sure it matches the listing's description and photos. For electronics, it's a good idea to test them if possible.",
  },
  {
    icon: Handshake,
    title: "4. Complete the Trade",
    description: "Once you are satisfied with the item's condition, you can complete the payment with the seller. Enjoy your new item!",
  },
];

export default function HowToTransactPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            How to Transact Safely
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
            Follow these simple steps for a smooth and secure transaction every time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {transactionSteps.map((tip, index) => (
            <Card key={index} className="flex items-start p-6 space-x-4">
              <div className="bg-primary/10 text-primary p-3 rounded-full">
                <tip.icon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="mb-2 text-xl font-headline">{tip.title}</CardTitle>
                <CardContent className="p-0 text-muted-foreground">
                  {tip.description}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                    <ShieldCheck /> A Friendly Reminder
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-blue-700/80">Trust your instincts. If a deal seems too good to be true or a situation feels uncomfortable, it's okay to walk away. Your safety is the top priority. Report any suspicious activity to keep the community safe.</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
