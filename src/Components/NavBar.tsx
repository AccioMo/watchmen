import iconYou from '../assets/you.svg';
import iconFind from '../assets/find.svg';

function NavBar() {
	return (
		<div className="py-4 px-8">
			<div className="flex h-full w-full justify-between items-center px-4 py-4">
				<div className="card w-[130px]">
					<div className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">
						<img src={iconYou} alt="You" width={36} />
						<div className="px-2">You</div>
					</div>
				</div>
				<div className="card">
					<ul className="flex justify-center items-center gap-4 px-8">
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">For Me</li>
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">Popular</li>
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">New</li>
					</ul>
				</div>
				<div className="card w-[130px]">
					<div className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">
						<img src={iconFind} alt="Find" width={24} />
						<div className="px-2">Find</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NavBar;
