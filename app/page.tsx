import CompanyCarousel from '@/components/company-carousel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { BarChart, Calendar, ChevronRight, Layout } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import faqsData from '@/data/faqs.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    title: 'Intuitive Kanban Boards',
    description:
      'Visualize your workflow and optimize team productivity with our easy-to-use Kanban boards.',
    icon: Layout,
  },
  {
    title: 'Powerful Sprint Planning',
    description:
      'Plan and manage sprints effectively, ensuring your team stays focused on delivering value.',
    icon: Calendar,
  },
  {
    title: 'Comprehensive Reporting',
    description:
      "Gain insights into your team's performance with detailed, customizable reports and analytics.",
    icon: BarChart,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* hero */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col">
          Streamline Your Workflow <br /> with{' '}
          <Image
            src="/logo.png"
            alt="Logo"
            width={400}
            height={300}
            className="h-14 sm:h-24 w-auto object-contain"
          />
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Empower your team with our intuitive project management solution.
        </p>

        <Link href="/onboarding">
          <Button size="lg" className="mr-2">
            Get Started <ChevronRight size={18} />
          </Button>
        </Link>

        <Link href="#features">
          <Button size="lg" variant={'outline'} className="mr-4">
            Learn More
          </Button>
        </Link>
      </section>

      <section id="features" className="bg-gray-900 py-20 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              return (
                <Card key={feature.title} className="bg-gray-800">
                  <CardContent className="pt-6">
                    {feature.icon && (
                      <feature.icon className="mb-4 h-12 w-12 text-blue-300" />
                    )}
                    <CardTitle className="text-xl font-semibold mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Trusted by Industry Leaders
          </h3>
          <CompanyCarousel />
        </div>
      </section>

      <section id="faqs" className="bg-gray-900 px-5 py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible>
            {faqsData.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="" className="text-center px-5 py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-xl mb-12">
            Get started with Jira-o today and experience the difference in your
            project management.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="animate-bounce">
              Start for Free <ChevronRight className="ml-2 h-5 w-5" size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
