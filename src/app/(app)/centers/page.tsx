import CSCLocatorMap from "@/components/maps/CSCLocatorMap";

export const metadata = {
    title: "Find Nearby CSC & e-Seva Centers | SBMS",
    description: "Locate Common Service Centers and Village Level Entrepreneurs (VLEs) near you for in-person scheme application assistance."
};

export default function CentersPage() {
    return (
        <div style={{ padding: "8px 0" }}>
            <CSCLocatorMap />
        </div>
    );
}
