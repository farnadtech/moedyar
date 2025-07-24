import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderProps {
  title: string;
  description: string;
  suggestion?: string;
}

export default function Placeholder({ title, description, suggestion }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700">
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">رویداد یار</span>
          </div>
        </div>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-yellow-900">{title}</CardTitle>
            <CardDescription className="text-yellow-700">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-yellow-800 mb-6">
              {suggestion || "این بخش در حال توسعه است و به زودی در دسترس خواهد بود."}
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  بازگشت به صفحه اصلی
                </Button>
              </Link>
              <Link to="/register/personal">
                <Button variant="outline" className="w-full">
                  ثبت نام حساب شخصی
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            سوال یا پیشنهادی دارید؟{" "}
            <Link to="/support" className="text-brand-600 hover:text-brand-700">
              با ما تماس بگیرید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
